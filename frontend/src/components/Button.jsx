function Button({
  children,
  type = "button",
  className = "btn btn-primary",
  onClick,
}) {
  return (
    <button
      type={type}
      className={className}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default Button;