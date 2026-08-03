import { Link } from 'react-router-dom';
import { parseApiError } from '../../../shared/lib';
import { Button } from '../../../shared/ui';
import styles from './authentication-form.module.scss';

export const AuthenticationForm = ({
  title,
  children,
  onSubmit,
  isSubmitting,
  submissionError,
  submitButtonLabel,
  submittingButtonLabel,
  footerText,
  footerLinkText,
  footerLinkPath,
}) => {
  return (
    <div className={styles.authCard}>
      <h1 className={styles.title}>{title}</h1>

      <form className={styles.form} onSubmit={onSubmit}>
        {children}

        {submissionError && (
          <div className={styles.formError}>
            {parseApiError(submissionError)}
          </div>
        )}

        <Button disabled={isSubmitting} className={styles.submitButton}>
          {isSubmitting ? submittingButtonLabel : submitButtonLabel}
        </Button>
      </form>

      <div className={styles.footerText}>
        {footerText}{' '}
        <Link className={styles.footerLink} to={footerLinkPath}>
          {footerLinkText}
        </Link>
      </div>
    </div>
  );
};

export const AuthenticationFormFieldError = ({ message }) => {
  if (!message) {
    return null;
  }

  return <div className={styles.fieldError}>{message}</div>;
};
