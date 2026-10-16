import { profile } from '../profile.js';

export default function Skills() {
  return (
    <section className="section" id="skills" aria-labelledby="skills-h">
      <div className="wrap">
        <h2 id="skills-h" className="dir">Skills</h2>
        <div className="skill-grid">
          {profile.skills.map((g) => (
            <div key={g.group} className="skill-pane">
              <div className="skill-pane-bar">~/skills/{g.group.toLowerCase().replace(/\s+/g, '-')}</div>
              <div className="skill-pane-body">
                {g.items.map((item) => (
                  <div key={item} className="skill-item">{item}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
