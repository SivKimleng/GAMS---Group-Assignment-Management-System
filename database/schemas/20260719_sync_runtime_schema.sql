USE GAMS;

-- Brings older cloud databases in line with the current backend/runtime schema.
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS is_private BOOLEAN NOT NULL DEFAULT FALSE AFTER priority;

CREATE TABLE IF NOT EXISTS submissions (
    submission_id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL UNIQUE,
    submitted_by_user_id INT NOT NULL,
    submission_url MEDIUMTEXT NULL,
    file_name VARCHAR(255) NULL,
    is_submitted BOOLEAN NOT NULL DEFAULT FALSE,
    is_late BOOLEAN NOT NULL DEFAULT FALSE,
    submitted_at DATETIME NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_submissions_task FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_submissions_user FOREIGN KEY (submitted_by_user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS submission_materials (
    submission_material_id INT AUTO_INCREMENT PRIMARY KEY,
    submission_id INT NOT NULL,
    material_name VARCHAR(255) NOT NULL,
    material_url MEDIUMTEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_submission_materials_submission FOREIGN KEY (submission_id) REFERENCES submissions(submission_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS assignment_files (
    assignment_file_id INT AUTO_INCREMENT PRIMARY KEY,
    assignment_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url MEDIUMTEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_assignment_files_assignment FOREIGN KEY (assignment_id) REFERENCES assignments(assignment_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
