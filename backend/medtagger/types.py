"""Module containing all custom types."""
from typing import NewType, NamedTuple


ScanID = NewType('ScanID', str)
SliceID = NewType('SliceID', str)
LabelID = NewType('LabelID', str)
LabelSelectionID = NewType('LabelSelectionID', str)
ScanMetadata = NamedTuple('ScanMetadata', [('scan_id', ScanID), ('number_of_slices', int)])

SliceLocation = NewType('SliceLocation', float)
SlicePosition = NamedTuple('SlicePosition', [('x', float), ('y', float), ('z', float)])

LabelPosition = NamedTuple('LabelPosition', [('x', float), ('y', float), ('slice_index', int)])
LabelShape = NamedTuple('LabelShape', [('width', float), ('height', float)])
LabelSelectionBinaryMask = NewType('LabelSelectionBinaryMask', str)

UserInfo = NamedTuple('UserInfo', [('id', int), ('email', str), ('first_name', str), ('last_name', str), ('role', str)])