type Props = {
  message: string;
  id?: string;
};

/** Inline alert for forms / widgets. */
export function UserErrorBanner({ message, id }: Props) {
  if (!message.trim()) return null;
  return (
    <p className="user-error-banner" role="alert" id={id}>
      {message}
    </p>
  );
}
