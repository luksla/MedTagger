"""Module responsible for defining endpoints for Validation."""
from typing import Any

import numpy as np
from flask import request
from flask_restplus import Resource

from medtagger.api import api
from medtagger.api.validation import serializers
from medtagger.types import ScanID
from medtagger.repositories.scans import ScansRepository
from medtagger.operations.labels import generate_3d_mask_from_3d_masks, get_3d_mask_for_label

validation_ns = api.namespace('validation', 'Validation mechanism for Scans and its Labels')


@validation_ns.route('/<string:scan_id>')
class ValidationPage(Resource):

    @staticmethod
    @validation_ns.expect(serializers.in__validation)
    def post(scan_id: ScanID) -> Any:
        labels_ids = request.json['labels_ids']
        scan = ScansRepository.get_scan_by_id(scan_id)
        labels = scan.labels

        if not labels_ids:
            labels_ids = [label.id for label in labels]

        _all_masks = [(get_3d_mask_for_label(label), label.id in labels_ids) for label in labels]
        _masks_for_generation = [mask[0] for mask in _all_masks if mask[1]]

        combined_mask = generate_3d_mask_from_3d_masks(_masks_for_generation, normalize=False)
        agreement_ratio = 100 * np.sum(combined_mask) / np.count_nonzero(combined_mask)
        labels_similarities = [{
            'label_id': label.id,
            'used_for_generation': label.id in labels_ids,
            'similarity': 100 - 100 * (np.abs(np.sum(combined_mask) - np.sum(_all_masks[idx][0])) / np.sum(combined_mask)),
        } for idx, label in enumerate(labels)]

        return {
            'scan_id': scan_id,
            'agreement_ratio': agreement_ratio,
            'label_start': int(np.min(np.nonzero(combined_mask)[0])),
            'label_end': int(np.max(np.nonzero(combined_mask)[0])),
            'labels_similarities': labels_similarities,
        }
