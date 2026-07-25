import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Mail, Phone, User } from "lucide-react";
import { motion } from "framer-motion";
import presidentPhoto from "@assets/president-daniel-temple.asset.json_1782102193392.jpg";

type Executive = {
  full_name: string;
  position: string;
  bio?: string;
  image_url?: string;
  email?: string;
  phone?: string;
};

const OTHER_EXECUTIVES: Executive[] = [
  {
    full_name: "Saliman Sukura ACA.",
    position: "Vice President",
    bio: "",
    image_url:
      "https://i.pinimg.com/736x/46/fa/de/46fadeda2573cbe343b9a58f2f27ea6c.jpg",
    email: "",
    phone: "",
  },
  {
    full_name: "IWEKHAO ROTIMI RAYMOND",
    position: "Director of Sports",
    bio: "",
    image_url:
      "https://i.pinimg.com/736x/55/0a/96/550a96115012cc2551bd1bfe31907ba9.jpg",
    email: "",
    phone: "",
  },
  {
    full_name: "Adekunle Adewale",
    position: "National PRO II",
    bio: "",
    image_url:
      "https://i.pinimg.com/736x/a3/5f/2f/a35f2f63df0292bcbf63c4f2ba071005.jpg",
    email: "",
    phone: "",
  },
  {
    full_name: "Monday Inusa",
    position: "Vice president, North Central",
    bio: "",
    image_url:
      "https://i.pinimg.com/736x/02/22/95/022295fe890136d2ba80c7c3b1c50d32.jpg",
    email: "",
    phone: "",
  },

  {
    full_name: "Isabu Divinepower Chinemerem",
    position: "Director of Welfare",
    bio: "",
    image_url:
      "https://i.pinimg.com/736x/94/26/c3/9426c31bf50500161833c3156b472987.jpg",
    email: "",
    phone: "",
  },
  {
    full_name: "Kayang lilian",
    position: "Miss NUASA National",
    bio: "",
    image_url:
      "https://i.pinimg.com/736x/ea/3a/9e/ea3a9ecbc84a733f455eac40d48a0e1a.jpg",
    email: "",
    phone: "",
  },
  {
    full_name: "ANYA VICTOR ORJII",
    position: "Mr NUASA National",
    bio: "",
    image_url:
      "https://i.pinimg.com/736x/f6/db/7b/f6db7b3aab2579e958ef34cc46c316f9.jpg",
    email: "",
    phone: "",
  },
  {
    full_name: "Oma-Benedi Jessica Eyikojowan",
    position: "Ex-Officio II",
    bio: "",
    image_url:
      "https://i.pinimg.com/736x/80/a1/8c/80a18c47a2d21ef19f2a8f2da61745fb.jpg",
    email: "",
    phone: "",
  },

  {
    full_name: "Aisha Olabimpe Abolarinwa",
    position: "Ex-Officio I",
    bio: "",
    image_url:
      "https://i.pinimg.com/736x/ab/a1/00/aba100828eff381bd3207ae7f773d4c4.jpg",
    email: "",
    phone: "",
  },

  {
    full_name: "Lukman Olarongbe ACA.",
    position: "Immediate Past President",
    bio: "",
    image_url:
      "https://i.pinimg.com/736x/84/a1/18/84a118bfbad2912960f58f40ff5fdb08.jpg",
    email: "",
    phone: "",
  },

  {
    full_name: "Olotu Zion Iremide",
    position: "Public Relations Officer",
    bio: "",
    image_url:
      "https://i.pinimg.com/736x/f0/a5/4c/f0a54c3b2dd9781458ae3670f780f10d.jpg",
    email: "",
    phone: "",
  },

  {
    full_name: "Mustapha Sanni Orahachi",
    position: "Deputy Financial Secretary",
    bio: "",
    image_url:
      "https://i.pinimg.com/736x/94/3e/dd/943edd23f49f8126223eab5dda0a5fac.jpg",
    email: "",
    phone: "",
  },

  {
    full_name: "lorwase Maureen Msurshima",
    position: "Deputy Director of Socials",
    bio: "",
    image_url:
      "https://i.pinimg.com/736x/62/4c/9d/624c9d894ec78430289487716daaeb5e.jpg",
    email: "",
    phone: "",
  },

  {
    full_name: "JOHN SAMUEL FRIDAY",
    position: "DIRECTOR OF SOCIALS",
    bio: "",
    image_url:
      "https://i.pinimg.com/736x/bf/aa/11/bfaa11e2c9c269dda45ed8592b34fd98.jpg",
    email: "",
    phone: "",
  },

  {
    full_name: "Abubakar Abdulranman Shamaki",
    position: "Director of Research",
    bio: "",
    image_url:
      "https://i.pinimg.com/736x/f8/84/c6/f884c61d6bd668a4b9462742ae692f11.jpg",
    email: "",
    phone: "",
  },

  {
    full_name: "Abani Mitchell Okereke",
    position: "FINANCIAL SECRETARY",
    bio: "",
    image_url:
      "https://i.pinimg.com/736x/25/97/62/259762b7300c5e7cb5fc12d29b327094.jpg",
    email: "",
    phone: "",
  },

  {
    full_name: "LAMVONG TIMJUL TIMOTHY",
    position: "Treasurer",
    bio: "",
    image_url:
      "https://i.pinimg.com/736x/9b/19/ab/9b19abaeba5ee627b8cae44b4cb77a0d.jpg",
    email: "",
    phone: "",
  },

  {
    full_name: "Eze Chidubem Favour",
    position: "Vice President- South East",
    bio: "",
    image_url:
      "https://i.pinimg.com/736x/12/53/ce/1253ce90572a71402c74b5e28e629837.jpg",
    email: "",
    phone: "",
  },

  {
    full_name: "DORCAS SONGO MCLEAN",
    position: "Vice President- South South",
    bio: "",
    image_url:
      "https://i.pinimg.com/736x/02/a5/ea/02a5ea1ec6effa80ff7447894110bfc7.jpg",
    email: "",
    phone: "",
  },

  {
    full_name: "Ukahi Treasure Okpeje",
    position: "Vice President- South West",
    bio: "",
    image_url:
      "https://i.pinimg.com/736x/84/19/87/8419873adca7c83ce57706d7196df6e8.jpg",
    email: "",
    phone: "",
  },

  {
    full_name: "Obielozie Florence Chisom",
    position: "Vice President- North West",
    bio: "",
    image_url:
      "https://i.pinimg.com/736x/c0/b3/2d/c0b32de6baae1b5ca37c29fb90063a62.jpg",
    email: "",
    phone: "",
  },

  {
    full_name: "Suleman Ahmed Jidda",
    position: "Vice President- North East",
    bio: "",
    image_url:
      "https://i.pinimg.com/736x/e8/29/76/e829764629a66a5ea0ba8515e9d4a4ee.jpg",
    email: "",
    phone: "",
  },

  {
    full_name: "Alaribe christabel Chioma",
    position: "Deputy secretary General",
    bio: "",
    image_url:
      "https://i.pinimg.com/736x/0e/54/b4/0e54b451f942f8f48714d41642b85f5d.jpg",
    email: "",
    phone: "",
  },

  {
    full_name: "USMAN ABUBAKAR SODIQ",
    position: "Secretary General",
    bio: "",
    image_url:
      "https://i.pinimg.com/736x/db/01/70/db0170aa7c6138bc5c20a23c2dc86c42.jpg",
    email: "",
    phone: "",
  },
  {
    full_name: "Ruth Stephen",
    position: "Assistant director of research",
    bio: "",
    image_url:
      "https://i.pinimg.com/736x/23/fb/52/23fb522850aee7c1ce3238e074e3a8c1.jpg",
    email: "",
    phone: "",
  },
];

const Executives = () => {
  const executives = OTHER_EXECUTIVES;

  return (
    <Layout>
      <SEO
        title='NUASA National Executives'
        description='Meet the National Executives of the NUASA National Body — leaders driving the future of accounting students in Nigeria.'
        path='/executives'
      />
      <section className='bg-primary text-primary-foreground py-16'>
        <div className='content-container'>
          <p className='text-xs uppercase tracking-[0.25em] text-accent font-semibold mb-3'>
            Leadership
          </p>
          <h1 className='font-serif text-4xl md:text-5xl font-bold mb-3'>
            National Executives
          </h1>
          <p className='text-primary-foreground/80 max-w-2xl'>
            The team leading NUASA at the national level. Each executive serves
            the community with a clear portfolio and mandate.
          </p>
        </div>
      </section>

      <section className='content-container py-14'>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className='grid lg:grid-cols-[360px_1fr] gap-10 items-center bg-card border border-border rounded-3xl overflow-hidden shadow-lg mb-14'
        >
          <div className='aspect-[4/5] relative overflow-hidden'>
            <img
              src={presidentPhoto}
              alt='Daniel O. Temple — NUASA National Executive President'
              className='w-full h-full object-cover'
            />
            <span className='absolute top-4 left-4 bg-accent text-accent-foreground text-[10px] font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full shadow'>
              Executive President
            </span>
          </div>
          <div className='p-8 lg:p-12'>
            <p className='text-xs uppercase tracking-[0.25em] text-accent font-semibold mb-2'>
              Office of the President
            </p>
            <h2 className='font-serif text-3xl md:text-4xl font-bold text-foreground mb-2'>
              Daniel O. Temple, AAT
            </h2>
            <p className='text-base text-accent font-medium mb-5'>
              Executive President, NUASA National Body
            </p>
            <p className='text-base text-foreground/80 leading-relaxed'>
              Leading a new chapter for accounting students across Nigeria —
              building a community that learns, networks, and grows together.
              From the National E-Library to the annual convention, every
              initiative is shaped around your journey from classroom to
              chartered.
            </p>
          </div>
        </motion.div>

        <h2 className='font-serif text-2xl font-bold text-foreground mb-6'>
          Other Executives
        </h2>
        <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-6'>
          {executives.map((exec, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className='overflow-hidden h-full flex flex-col'>
                <div className='aspect-[4/5] bg-muted relative overflow-hidden'>
                  {exec.image_url ? (
                    <img
                      src={exec.image_url}
                      alt={`${exec.full_name} — ${exec.position}`}
                      className='w-full h-full object-cover'
                      loading='lazy'
                    />
                  ) : (
                    <div className='w-full h-full flex flex-col items-center justify-center gap-3 text-muted-foreground bg-muted'>
                      <User className='w-16 h-16 opacity-40' />
                    </div>
                  )}
                </div>
                <div className='p-5 flex-1 flex flex-col'>
                  <h3 className='font-serif font-bold text-lg text-foreground'>
                    {exec.full_name || (
                      <span className='text-muted-foreground italic'>
                        Name TBA
                      </span>
                    )}
                  </h3>
                  <p className='text-sm text-accent font-medium mb-2'>
                    {exec.position}
                  </p>
                  {exec.bio && (
                    <p className='text-sm text-muted-foreground line-clamp-4 mb-3'>
                      {exec.bio}
                    </p>
                  )}
                  <div className='mt-auto space-y-1 text-xs text-muted-foreground'>
                    {exec.email && (
                      <div className='flex items-center gap-2'>
                        <Mail className='w-3 h-3' /> {exec.email}
                      </div>
                    )}
                    {exec.phone && (
                      <div className='flex items-center gap-2'>
                        <Phone className='w-3 h-3' /> {exec.phone}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default Executives;
