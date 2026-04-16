import { TEXT } from "../constants/text.js";

function mapsUrl(lat, lng) {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

export function Location({ data }) {
  const location = data?.data?.location ?? null;

  const lat = location?.lat ? Number(location.lat) : null;
  const lng = location?.long ? Number(location.long) : null;
  const hint = location?.hint ?? null;
  const image = location?.image ?? null;

  const canOpen = lat !== null && lng !== null;
  const href = canOpen ? mapsUrl(lat, lng) : null;

  return (
    <div className="center">
      <div className="fade show">
        <h1 style={{ marginBottom: 24 }}>{TEXT.LOCATION_TITLE}</h1>

        {image && (
          <img
            src={image}
            alt="Location"
            style={{
              width: "100%",
              maxWidth: 320,
              maxHeight: 320,
              minWidth: 320,
              minHeight: 320,
              borderRadius: 12,
              marginBottom: 12,
            }}
          />
        )}

        {hint ? (
          <div className="block">
            <div className="label">{TEXT.LOCATION_HINT_TITLE}</div>
            <div>{hint}</div>
          </div>
        ) : (
          <p className="muted">{TEXT.FALLBACK_LOCATION}</p>
        )}

        <a
          className={canOpen ? "btn" : "btn disabled"}
          href={href ?? undefined}
          target="_blank"
          rel="noreferrer"
          aria-disabled={!canOpen}
          onClick={(e) => {
            if (!canOpen) e.preventDefault();
          }}
          style={{marginTop: 12,}}
        >
          {TEXT.OPEN_MAPS}
        </a>
      </div>
    </div>
  );
}
