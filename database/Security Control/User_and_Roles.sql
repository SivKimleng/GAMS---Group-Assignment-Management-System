-- GAMS MySQL users and privileges (MySQL 8+)
-- Run this script as a MySQL administrator after database/schemas/schema.sql.
-- Change every example password before running. Do not commit real passwords.
--
-- Important: Student, Instructor, Admin, Leader and Member are APPLICATION roles.
-- They are stored in users.role and user_groups.member_role, and are enforced by
-- the Express backend. Browser users must never connect directly to MySQL.

USE GAMS;

-- Database roles. Re-running this script is safe.
CREATE ROLE IF NOT EXISTS 'gams_app_role';
CREATE ROLE IF NOT EXISTS 'gams_readonly_role';
CREATE ROLE IF NOT EXISTS 'gams_db_admin_role';

-- The backend needs CRUD access but no schema-changing privileges.
GRANT SELECT, INSERT, UPDATE, DELETE
ON GAMS.users TO 'gams_app_role';
GRANT SELECT, INSERT, UPDATE, DELETE
ON GAMS.groupwork TO 'gams_app_role';
GRANT SELECT, INSERT, UPDATE, DELETE
ON GAMS.user_groups TO 'gams_app_role';
GRANT SELECT, INSERT, UPDATE, DELETE
ON GAMS.assignments TO 'gams_app_role';
GRANT SELECT, INSERT, UPDATE, DELETE
ON GAMS.tasks TO 'gams_app_role';
GRANT SELECT, INSERT, UPDATE, DELETE
ON GAMS.reminders TO 'gams_app_role';

-- Useful for lecturers/auditors who need reports but must not change data.
GRANT SELECT ON GAMS.* TO 'gams_readonly_role';

-- Intended only for a trusted database maintainer; not for the web application.
GRANT ALL PRIVILEGES ON GAMS.* TO 'gams_db_admin_role';

-- Backend service account. Use a strong password from a secret manager in real deployment.
CREATE USER IF NOT EXISTS 'gams_api'@'localhost'
  IDENTIFIED BY 'CHANGE_THIS_TO_A_LONG_RANDOM_PASSWORD';
GRANT 'gams_app_role' TO 'gams_api'@'localhost';
SET DEFAULT ROLE 'gams_app_role' TO 'gams_api'@'localhost';

-- Optional account for read-only reports. Remove this block if it is not needed.
CREATE USER IF NOT EXISTS 'gams_reporter'@'localhost'
  IDENTIFIED BY 'CHANGE_THIS_REPORTER_PASSWORD';
GRANT 'gams_readonly_role' TO 'gams_reporter'@'localhost';
SET DEFAULT ROLE 'gams_readonly_role' TO 'gams_reporter'@'localhost';

-- Optional trusted database maintainer. Never use this account in backend/.env.
CREATE USER IF NOT EXISTS 'gams_db_admin'@'localhost'
  IDENTIFIED BY 'CHANGE_THIS_ADMIN_PASSWORD';
GRANT 'gams_db_admin_role' TO 'gams_db_admin'@'localhost';
SET DEFAULT ROLE 'gams_db_admin_role' TO 'gams_db_admin'@'localhost';

-- Verification queries (run after the grants above):
-- SHOW GRANTS FOR 'gams_api'@'localhost';
-- SHOW GRANTS FOR 'gams_reporter'@'localhost';
-- SHOW GRANTS FOR 'gams_db_admin'@'localhost';
-- SELECT user, host FROM mysql.user WHERE user LIKE 'gams_%';

-- Then set backend/.env to this restricted account, for example:
-- DB_USER=gams_api
-- DB_PASSWORD=<the password chosen above>
-- DB_NAME=GAMS
