"""Module responsible for storage of serializers used in Validation endpoints."""
from flask_restplus import fields

from medtagger.api import api

in__validation = api.model('Validation model', {
    'labels_ids': fields.List(fields.String(description='Label\'s IDs', required=True)),
})
