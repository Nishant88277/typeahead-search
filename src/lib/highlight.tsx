export const HighlightMatch = (text: string, query: string) => {
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return (
      <span>
        {parts.map((part, index) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <strong key={index}>{part}</strong>
          ) : (
            part
          )
        )}
      </span>
    );
  };