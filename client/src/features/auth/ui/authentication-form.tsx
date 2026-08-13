import type { FormEventHandler, ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { parseApiError } from '@shared/lib';
import { Button } from '@shared/ui';

import styles from './authentication-form.module.scss';

interface AuthenticationFormProps {
  readonly title: string;
  readonly children: ReactNode;
  readonly onSubmit: FormEventHandler<HTMLFormElement>;
  readonly isSubmitting: boolean;
  readonly submissionError?: unknown;
  readonly submitButtonLabel: string;
  readonly submittingButtonLabel: string;
  readonly footerText: string;
  readonly footerLinkText: string;
  readonly footerLinkPath: string;
}

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
}: AuthenticationFormProps) => {
  return (
    <div className={styles.authCard}>
      <h1 className={styles.title}>{title}</h1>

      <form className={styles.form} onSubmit={onSubmit}>
        {children}

        {Boolean(submissionError) && (
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

interface AuthenticationFormFieldErrorProps {
  readonly message?: string;
}

export const AuthenticationFormFieldError = ({
  message,
}: AuthenticationFormFieldErrorProps) => {
  if (!message) {
    return null;
  }

  return <div className={styles.fieldError}>{message}</div>;
};
