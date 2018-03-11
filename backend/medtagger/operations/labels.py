"""Module responsible for operations on Labels."""
from typing import List, Tuple, NamedTuple

import numpy as np
from scipy import interpolate

from medtagger.database.models import Label, LabelSelection


class InterpolatedSelection(NamedTuple):
    """Named Tuple representing Interpolated Selection."""

    x: float       # Range: <0,1>
    y: float       # Range: <0,1>
    width: float   # Range: <0,1>
    height: float  # Range: <0,1>
    slice_index: int


def generate_3d_mask_from_labels(labels: List[Label]) -> np.ndarray:
    """Generate and return a single 3D mask based on given list of Labels.

    :param labels: list of Labels that should be used to generate 3D mask
    :return: 3D numpy array with common 3D mask for whole list of Labels
    """
    return generate_3d_mask_from_3d_masks([get_3d_mask_for_label(label) for label in labels])


def generate_3d_mask_from_3d_masks(masks: List[np.ndarray], normalize: bool = True) -> np.ndarray:
    """Generate and return a single 3D mask based on given list of Labels.

    :param labels: list of Labels that should be used to generate 3D mask
    :return: 3D numpy array with common 3D mask for whole list of Labels
    """
    all_masks = np.array(masks)
    mean_mask = np.mean(all_masks, axis=0)
    if normalize:
        min_value = np.min(mean_mask)
        max_value = np.max(mean_mask)
        normalized_mask = (mean_mask - min_value) / (max_value - min_value)
        return normalized_mask
    return mean_mask


def get_3d_mask_for_label(label: Label, size_x: int = 512, size_y: int = 512) -> np.ndarray:
    """Prepare 3D binary mask for given Label.

    :param label: MedTagger's Label object that contains user's selections
    :param size_x: size of output numpy array in X axis
    :param size_y: size of output numpy array in Y axis
    :return: 3D numpy array with binary values that represents interpolated Label
    """
    scan = label.scan
    interpolated_label_selections = get_interpolated_label_selections(label.selections)
    mask = np.zeros((scan.declared_number_of_slices, size_y, size_x))
    for selection in interpolated_label_selections:
        x1 = (selection.x * size_x).astype(int)
        y1 = (selection.y * size_y).astype(int)
        x2 = (x1 + selection.width * size_x).astype(int)
        y2 = (y1 + selection.height * size_y).astype(int)
        idx = selection.slice_index
        mask[idx, y1:y2, x1:x2] = 1
    return mask


def get_interpolated_label_selections(selections: List[LabelSelection]) -> List[InterpolatedSelection]:
    """Return list of Interpolated Selections that lays between first and last user's Label Selection.

    This function prepares points for each edge in the 3D Label. Based on such list, function prepares
    a list of all selections that lays on each Slice.

    Let's take an example Label with Selections:
      - x: 0, y: 0, width: 1, height: 1, slice_index: 0
      - x: 0.4, y: 0.4, width: 0.2, height: 0.2, slice_index: 50
      - x: 0, y: 0, width: 1, height: 1, slice_index: 100

    It then takes all points for each edge mapped to one view (because we are interpolating in 2D):
      - points on edge A mapped to X view: (0, 0), (0.4, 50), (0, 100)
      - points on edge B mapped to X view: (1, 0), (0.6, 50), (1, 100)
      - points on edge C mapped to Y view: (0, 0), (0.4, 50), (0, 100)
      - points on edge D mapped to Y view: (1, 0), (0.6, 50), (1, 100)

    Such points are then interpolated and zipped into Interpolated Selections that will be
    computed for each Slice between first user's Selection and last user's Selection.

    :param selections: list of all User's Label Selections
    :return: list of all Interpolated Selections
    """
    selections = sorted(selections, key=lambda x: x.slice_index)

    points_on_edge_A = [(selection.position_x, selection.slice_index) for selection in selections]
    interpolated_points_A = _get_interpolated_points(points_on_edge_A)

    points_on_edge_B = [(selection.position_x + selection.shape_width, selection.slice_index) for selection in selections]
    interpolated_points_B = _get_interpolated_points(points_on_edge_B)

    points_on_edge_C = [(selection.position_y, selection.slice_index) for selection in selections]
    interpolated_points_C = _get_interpolated_points(points_on_edge_C)

    points_on_edge_D = [(selection.position_y + selection.shape_height, selection.slice_index) for selection in selections]
    interpolated_points_D = _get_interpolated_points(points_on_edge_D)

    min_slice_index = min(selection.slice_index for selection in selections)
    max_slice_index = max(selection.slice_index for selection in selections)
    slice_indexes = np.arange(min_slice_index, max_slice_index+1, 1)

    x = interpolated_points_A
    y = interpolated_points_C
    width = interpolated_points_B - x
    height = interpolated_points_D - y
    return [InterpolatedSelection(*v) for v in zip(x, y, width, height, slice_indexes)]


def _get_interpolated_points(points: List[Tuple[float, float]]) -> np.ndarray:
    """Calculate interpolated points.

    :param points: list of points in the 2D coordinate system
    :return: numpy array with interpolated points (its X values for each Slice)
    """
    # Prepare X & Y values
    points_x = np.array([point[0] for point in points])
    points_y = np.array([point[1] for point in points])
    max_y, min_y = np.max(points_y), np.min(points_y)

    # Interpolation on above points
    tck, _ = interpolate.splprep([points_x, points_y], s=0, k=3)
    step = 1 / np.abs(max_y - min_y)
    ticks = np.arange(0, 1 + step, step)
    points_after_interpolation = interpolate.splev(ticks, tck)
    interpolated_points_x, interpolated_points_y = points_after_interpolation[0], points_after_interpolation[1]

    # Calculate X values for each Y value that lays between minimum & maximum Label Selection
    x_values = []
    for y in np.arange(min_y, max_y + 1, 1):
        # There is only one X value that fits the best for given Y level
        best_x_index = np.abs(interpolated_points_y - y).argsort()[0]
        x_values.append(interpolated_points_x[best_x_index])
    return np.array(x_values)
