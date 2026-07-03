import "./service-centre.css";
import { publicAsset } from "../ackodrive/publicAsset";

const ASSETS = "/assets/figma";

function asset(path: string): string {
  return publicAsset(`${ASSETS}/${path}`);
}

const CAROUSEL = [
  {
    tag: "FREE CAR PICKUP",
    title: "Crew verification at society gate before pickup",
    pill: "8 slots in next 24 hours",
    image: "carousel-1.png",
    imgClass: "sc-card__img--pickup",
    gradient:
      "linear-gradient(180.63deg, rgba(0,0,0,0) 14.47%, rgba(0,0,0,0.451) 38.9%, #000 83.85%)",
  },
  {
    tag: "INSPECTION",
    title: "Service estimate sent to your phone after inspection",
    pill: "Fix price, no mid-service surprise",
    image: "carousel-2.png",
    imgClass: "sc-card__img--inspection",
    gradient:
      "linear-gradient(180.78deg, rgba(0,0,0,0) 13.15%, rgba(0,0,0,0.34) 32.36%, #000 69.58%)",
  },
  {
    tag: "THE TEAM",
    title: "Anil, Suresh, Ajay with over 19 years of experience in Hyundai, Honda, BMW",
    pill: "Crew trained on OEM standards",
    image: "carousel-3.png",
    imgClass: "sc-card__img--team",
    gradient: "linear-gradient(179.12deg, rgba(0,0,0,0) 66%, #000 83.71%)",
    tall: true,
  },
  {
    tag: "PARTS",
    title: "Genuine car parts, unboxed on camera, every single time",
    pill: "Serial number and photos sent to your phone",
    image: "carousel-4.png",
    imgClass: "sc-card__img--parts",
    gradient:
      "linear-gradient(180deg, rgba(0,0,0,0) 30.94%, rgba(0,0,0,0.6) 62.65%, #000 83.91%)",
    tall: true,
  },
  {
    tag: "BACK TO YOU",
    title: "Same day-return and a 30-day ACKO warranty on every job",
    pill: "If anything goes wrong, we improve it for free",
    image: "carousel-5.png",
    imgClass: "sc-card__img--return",
    gradient:
      "linear-gradient(180.89deg, rgba(0,0,0,0) 25.54%, rgba(0,0,0,0.38) 42.88%, #000 71.23%)",
    tall: true,
  },
];

const PARTNERS = [
  {
    name: "Trident Hyundai",
    location: "Kudlu Gate, Bengaluru • 5.4 kms away",
    rating: 4.2,
    reviews: "300+ reviews",
  },
  {
    name: "Avigyan Hyundai",
    location: "Garebhavipalya, Bengaluru • 5.4 kms away",
    rating: 3.7,
    reviews: "124 reviews",
  },
];

function starImages(rating: number): string[] {
  const full = Math.floor(rating);
  const frac = Math.round((rating - full) * 10);
  const out: string[] = [];

  for (let i = 0; i < full && i < 5; i++) out.push(asset("star-full.png"));
  if (out.length < 5) {
    if (frac >= 7) out.push(asset("star-three-quarter.png"));
    else if (frac >= 2) out.push(asset("star-quarter.png"));
  }
  while (out.length < 5) out.push(asset("star-empty.png"));
  return out.slice(0, 5);
}

function Rating({ rating, reviews }: { rating: number; reviews: string }) {
  return (
    <div className="sc-rating">
      {starImages(rating).map((src, i) => (
        <img key={i} className="sc-rating__star" src={src} alt="" width={12} height={12} />
      ))}
      <span className="sc-rating__value">{rating}</span>
      <span className="sc-rating__reviews">({reviews})</span>
    </div>
  );
}

function Tick() {
  return <img className="sc-tick" src={asset("tick.png")} alt="" width={16} height={16} />;
}

export function ServiceCentreScreen() {
  return (
    <div className="sc-root">
      <header className="sc-header">
        <div className="sc-status">
          <span className="sc-status__time">23:10</span>
          <div className="sc-status__icons">
            <img src={asset("status-signal.png")} alt="" width={17} height={12} />
            <img src={asset("status-battery.png")} alt="" width={25} height={12} />
          </div>
        </div>
        <div className="sc-toolbar">
          <button type="button" className="sc-back" aria-label="Go back">
            <img src={asset("back.png")} alt="" width={24} height={24} />
          </button>
          <button type="button" className="sc-help">
            <img src={asset("help.png")} alt="" width={16} height={16} />
            <span>Help</span>
          </button>
        </div>
        <h1 className="sc-heading">Select your service centre</h1>
      </header>

      <main className="sc-main">
        <article className="sc-hero">
          <div className="sc-hero__badge">
            <span>Best for your car</span>
            <img src={asset("info.png")} alt="" width={14} height={14} />
          </div>

          <div className="sc-hero__body">
            <h2 className="sc-hero__title">ACKO Drive Service Centre</h2>
            <p className="sc-hero__meta">Kudlu gate, Bengaluru • Open till 08:00 PM</p>
            <Rating rating={4.2} reviews="300+ reviews" />
            <button type="button" className="sc-link">
              View 20+ images of the service centre
              <img src={asset("chevron.png")} alt="" width={16} height={16} />
            </button>
          </div>

          <hr className="sc-rule" />

          <section className="sc-carousel-section">
            <p className="sc-carousel-section__title">How car service day looks like here</p>
            <div className="sc-carousel">
              {CAROUSEL.map((item) => (
                <div key={item.tag} className={`sc-card${item.tall ? " sc-card--tall" : ""}`}>
                  <div className="sc-card__media">
                    <img
                      className={`sc-card__img ${item.imgClass}`}
                      src={asset(item.image)}
                      alt=""
                    />
                    <div className="sc-card__shade" style={{ background: item.gradient }} />
                  </div>
                  <div className="sc-card__copy">
                    <span className="sc-card__tag">{item.tag}</span>
                    <p className="sc-card__title">{item.title}</p>
                    <span className="sc-card__pill">{item.pill}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <hr className="sc-rule" />

          <section className="sc-pricing">
            <p className="sc-pricing__label">Services starting from</p>
            <div className="sc-pricing__row">
              <span className="sc-pricing__price">₹4,999 onwards</span>
              <span className="sc-pricing__save">Save minimum ₹2,400</span>
            </div>
            <ul className="sc-checklist">
              <li>
                <Tick /> Genuine parts at manufacturer price
              </li>
              <li>
                <Tick /> No diagnostic or consumables fee
              </li>
            </ul>
          </section>

          <button type="button" className="sc-feedback">
            <div>
              <p className="sc-feedback__title">How we catered to customer complaints</p>
              <p className="sc-feedback__sub">...since they faced experience issues</p>
            </div>
            <img src={asset("chevron.png")} alt="" width={20} height={20} />
          </button>

          <button type="button" className="sc-cta">
            See service options for your Endeavour
          </button>
        </article>

        <section className="sc-more">
          <div className="sc-more__intro">
            <h2 className="sc-more__title">Want more options?</h2>
            <p className="sc-more__desc">
              Choose from our partner garages. We handle seamless communication for these garages too.
            </p>
          </div>
          <div className="sc-tags">
            <span className="sc-tag">
              <Tick /> Priority service slots
            </span>
            <span className="sc-tag">
              <Tick /> FREE Pickup and drop
            </span>
          </div>
          {PARTNERS.map((p) => (
            <article key={p.name} className="sc-partner">
              <div className="sc-partner__info">
                <h3 className="sc-partner__name">{p.name}</h3>
                <p className="sc-partner__meta">{p.location}</p>
                <Rating rating={p.rating} reviews={p.reviews} />
              </div>
              <button type="button" className="sc-partner__btn">
                Book now
              </button>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
