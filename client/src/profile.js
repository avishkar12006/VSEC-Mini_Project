// Content that does not change often lives here. Certificates, projects and experience come from the API.
export const profile = {
  name: 'Avishkar Kapadnis',
  initials: 'AK',
  headline: 'B.Tech IT student at KBTCOE, Nashik. I build full-stack products and play CTFs.',
  facts: [
    ['college', 'KBTCOE, Nashik. B.Tech IT, graduating 2028'],
    ['focus', 'cybersecurity, full-stack web, applied ML'],
    ['looking for', 'internships and 2028 campus placements']
  ],
  links: {
    github: 'https://github.com/avishkar12006',
    linkedin: 'https://www.linkedin.com/in/avishkar-kapadnis-48a005368/'
  },
  about: [
    'I am a third-year IT student at KBTCOE in Nashik. I like problems where software meets something real: a pre-primary school that needs lessons its children can use, a satellite image with half the road hidden behind trees, a CTF flag that will not give up.',
    'I build full-stack products from the database to the interface (BrainBerry, FinIQ, a freelance learning platform) and I compete in capture-the-flag events. In early 2026 I interned in cybersecurity at Jyesta, and I have taught a networking and cybersecurity session to other students.'
  ],
  skills: [
    { group: 'Languages', items: ['C', 'C++', 'Python', 'JavaScript'] },
    { group: 'Web and mobile', items: ['React', 'Vite', 'HTML', 'CSS', 'Tailwind CSS', 'Node.js', 'Express', 'Flask', 'Flutter'] },
    { group: 'Data and cloud', items: ['MongoDB', 'PostgreSQL', 'Drizzle ORM', 'Firebase', 'Supabase'] },
    { group: 'Machine learning', items: ['PyTorch', 'CNNs', 'Image segmentation', 'Computer vision'] },
    { group: 'Security', items: ['Kali Linux', 'Nmap', 'Burp Suite', 'Wireshark', 'Netcat', 'cURL', 'TryHackMe'] },
    { group: 'Networking', items: ['TCP/IP and OSI', 'VLANs and DHCP', 'Cisco Packet Tracer'] },
    { group: 'Tools', items: ['Git', 'GitHub', 'Postman', 'VS Code'] }
  ]
};

export const CATEGORY_LABELS = {
  ctf: 'CTF competitions',
  cybersecurity: 'Cybersecurity training',
  hackathons: 'Hackathons and innovation',
  'web-tech': 'Web and tech courses',
  workshops: 'Workshops and events'
};

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
