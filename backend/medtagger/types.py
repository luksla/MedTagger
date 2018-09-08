"""Module containing all custom types."""
from typing import NewType, NamedTuple


ScanID = NewType('ScanID', str)
SliceID = NewType('SliceID', str)
LabelID = NewType('LabelID', str)
LabelElementID = NewType('LabelElementID', str)
LabelTagID = NewType('LabelTagID', int)
TaskID = NewType('TaskID', int)
PointID = NewType('PointID', str)

LabelingTime = NewType('LabelingTime', float)

ActionID = NewType('ActionID', int)
SurveyID = NewType('SurveyID', ActionID)
SurveyElementID = NewType('SurveyElementID', int)
SurveyElementKey = NewType('SurveyElementKey', str)
ActionResponseID = NewType('ActionResponseID', int)
SurveyResponseID = NewType('SurveyResponseID', ActionResponseID)

SliceLocation = NewType('SliceLocation', float)


class SlicePosition(NamedTuple):  # pylint: disable=too-few-public-methods
    """Describe position of a Slice."""

    x: float
    y: float
    z: float


class LabelPosition(NamedTuple):  # pylint: disable=too-few-public-methods
    """Describe position of a Label."""

    x: float
    y: float
    slice_index: int


class LabelShape(NamedTuple):  # pylint: disable=too-few-public-methods
    """Describe shape of a Label."""

    width: float
    height: float


class Point(NamedTuple):  # pylint: disable=too-few-public-methods
    """Describe a single Point."""

    x: float
    y: float
