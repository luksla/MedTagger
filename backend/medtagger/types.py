"""Module containing all custom types."""
from dataclasses import dataclass
from typing import NewType


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


@dataclass
class SlicePosition:
    x: float
    y: float
    z: float


@dataclass
class LabelPosition:
    x: float
    y: float
    slice_index: int


@dataclass
class LabelShape:
    width: float
    height: float


@dataclass
class Point:
    x: float
    y: float
