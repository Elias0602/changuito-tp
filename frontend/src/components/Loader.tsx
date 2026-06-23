interface Props {
  text?: string;
}

export function Loader({ text = "Cargando..." }: Props) {
  return (
    <div className="loader-changuito">
      <div className="emoji">🛒</div>
      <div className="dots">
        <div className="dot" />
        <div className="dot" />
        <div className="dot" />
      </div>
      <div className="text">{text}</div>
    </div>
  );
}
