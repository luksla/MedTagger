"""Add _created and _modified fields to all tables

Revision ID: f49f6dc9b600
Revises: ab732474a829
Create Date: 2018-04-26 23:21:25.375425

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f49f6dc9b600'
down_revision = 'ab732474a829'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('LabelSelections', sa.Column('_created', sa.DateTime(), server_default=sa.text('now()'), nullable=False))
    op.add_column('LabelSelections', sa.Column('_modified', sa.DateTime(), server_default=sa.text('now()'), nullable=False))
    op.add_column('Labels', sa.Column('_created', sa.DateTime(), server_default=sa.text('now()'), nullable=False))
    op.add_column('Labels', sa.Column('_modified', sa.DateTime(), server_default=sa.text('now()'), nullable=False))
    op.add_column('Roles', sa.Column('_created', sa.DateTime(), server_default=sa.text('now()'), nullable=False))
    op.add_column('Roles', sa.Column('_modified', sa.DateTime(), server_default=sa.text('now()'), nullable=False))
    op.add_column('ScanCategories', sa.Column('_created', sa.DateTime(), server_default=sa.text('now()'), nullable=False))
    op.add_column('ScanCategories', sa.Column('_modified', sa.DateTime(), server_default=sa.text('now()'), nullable=False))
    op.add_column('Scans', sa.Column('_created', sa.DateTime(), server_default=sa.text('now()'), nullable=False))
    op.add_column('Scans', sa.Column('_modified', sa.DateTime(), server_default=sa.text('now()'), nullable=False))
    op.add_column('Slices', sa.Column('_created', sa.DateTime(), server_default=sa.text('now()'), nullable=False))
    op.add_column('Slices', sa.Column('_modified', sa.DateTime(), server_default=sa.text('now()'), nullable=False))
    op.add_column('Users', sa.Column('_created', sa.DateTime(), server_default=sa.text('now()'), nullable=False))
    op.add_column('Users', sa.Column('_modified', sa.DateTime(), server_default=sa.text('now()'), nullable=False))


def downgrade():
    op.drop_column('Users', '_modified')
    op.drop_column('Users', '_created')
    op.drop_column('Slices', '_modified')
    op.drop_column('Slices', '_created')
    op.drop_column('Scans', '_modified')
    op.drop_column('Scans', '_created')
    op.drop_column('ScanCategories', '_modified')
    op.drop_column('ScanCategories', '_created')
    op.drop_column('Roles', '_modified')
    op.drop_column('Roles', '_created')
    op.drop_column('Labels', '_modified')
    op.drop_column('Labels', '_created')
    op.drop_column('LabelSelections', '_modified')
    op.drop_column('LabelSelections', '_created')
