"""Insert all database fixtures."""
import logging
import logging.config

from sqlalchemy import exists

from medtagger.database import db_session
from medtagger.database.models import ScanCategory, Role

logging.config.fileConfig('logging.conf')
logger = logging.getLogger(__name__)

CATEGORIES = [{
    'key': 'KIDNEYS',
    'name': 'Kidneys',
    'image_path': '../../../assets/icon/kidneys_category_icon.svg',
}, {
    'key': 'LIVER',
    'name': 'Liver',
    'image_path': '../../../assets/icon/liver_category_icon.svg',
}, {
    'key': 'HEART',
    'name': 'Hearth',
    'image_path': '../../../assets/icon/heart_category_icon.svg',
}, {
    'key': 'LUNGS',
    'name': 'Lungs',
    'image_path': '../../../assets/icon/lungs_category_icon.svg',
}]

ROLES = [
    {
        'name': 'admin',
    },
    {
        'name': 'doctor',
    },
    {
        'name': 'volunteer',
    },
]


def insert_scan_categories() -> None:
    """Insert all default Scan Categories if don't exist."""
    with db_session() as session:
        for row in CATEGORIES:
            category_key = row.get('key', '')
            category_exists = session.query(exists().where(ScanCategory.key == category_key)).scalar()
            if category_exists:
                logger.info('Scan Category exists with key "%s"', category_key)
                continue

            category = ScanCategory(**row)
            session.add(category)
            logger.info('Scan Category added for key "%s"', category_key)


def insert_user_roles() -> None:
    """Insert default user Roles."""
    with db_session() as session:
        for row in ROLES:
            role_name = row.get('name', '')
            role_exists = session.query(exists().where(Role.name == role_name)).scalar()
            if role_exists:
                logger.info('Role exists with name "%s"', role_name)
                continue

            role = Role(**row)
            session.add(role)
            logger.info('Role added for name "%s"', role_name)


if __name__ == '__main__':
    logger.info('Applying fixtures for Scan Categories...')
    insert_scan_categories()
    logger.info('Applying fixtures for user Roles...')
    insert_user_roles()
