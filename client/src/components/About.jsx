import { profile } from '../profile.js';
import ProfileCard from './ProfileCard.jsx';

export default function About({ certCount, ctfCount }) {
  return (
    <section className="section" id="about" aria-labelledby="about-h">
      <div className="wrap about-grid">
        <div>
          <h2 id="about-h" className="dir">About</h2>
          <div className="prose">
            {profile.about.map((p) => <p key={p.slice(0, 24)}>{p}</p>)}
          </div>
        </div>
        <aside>
          <ProfileCard certCount={certCount} ctfCount={ctfCount} />
        </aside>
      </div>
    </section>
  );
}
