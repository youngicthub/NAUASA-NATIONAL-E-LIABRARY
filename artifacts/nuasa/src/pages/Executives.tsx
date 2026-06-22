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
    full_name: "",
    position: "Vice President",
    bio: "",
    image_url: "",
    email: "",
    phone: "",
  },
  {
    full_name: "",
    position: "General Secretary",
    bio: "",
    image_url: "",
    email: "",
    phone: "",
  },
  {
    full_name: "",
    position: "Assistant General Secretary",
    bio: "",
    image_url: "",
    email: "",
    phone: "",
  },
  {
    full_name: "",
    position: "Financial Secretary",
    bio: "",
    image_url: "",
    email: "",
    phone: "",
  },
  {
    full_name: "",
    position: "Treasurer",
    bio: "",
    image_url: "",
    email: "",
    phone: "",
  },
  {
    full_name: "",
    position: "Public Relations Officer",
    bio: "",
    image_url: "",
    email: "",
    phone: "",
  },
  {
    full_name: "",
    position: "Director of Socials",
    bio: "",
    image_url: "",
    email: "",
    phone: "",
  },
  {
    full_name: "",
    position: "Director of Welfare",
    bio: "",
    image_url: "",
    email: "",
    phone: "",
  },
];

const Executives = () => {
  const executives = OTHER_EXECUTIVES;

  return (
    <Layout>
      <SEO
        title="NUASA National Executives"
        description="Meet the National Executives of the NUASA National Body — leaders driving the future of accounting students in Nigeria."
        path="/executives"
      />
      <section className="bg-primary text-primary-foreground py-16">
        <div className="content-container">
          <p className="text-xs uppercase tracking-[0.25em] text-accent font-semibold mb-3">
            Leadership
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-3">
            National Executives
          </h1>
          <p className="text-primary-foreground/80 max-w-2xl">
            The team leading NUASA at the national level. Each executive serves the community
            with a clear portfolio and mandate.
          </p>
        </div>
      </section>

      <section className="content-container py-14">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid lg:grid-cols-[360px_1fr] gap-10 items-center bg-card border border-border rounded-3xl overflow-hidden shadow-lg mb-14"
        >
          <div className="aspect-[4/5] relative overflow-hidden">
            <img
              src={presidentPhoto}
              alt="Daniel O. Temple — NUASA National Executive President"
              className="w-full h-full object-cover"
            />
            <span className="absolute top-4 left-4 bg-accent text-accent-foreground text-[10px] font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full shadow">
              Executive President
            </span>
          </div>
          <div className="p-8 lg:p-12">
            <p className="text-xs uppercase tracking-[0.25em] text-accent font-semibold mb-2">
              Office of the President
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">
              Daniel O. Temple, AAT
            </h2>
            <p className="text-base text-accent font-medium mb-5">
              Executive President, NUASA National Body
            </p>
            <p className="text-base text-foreground/80 leading-relaxed">
              Leading a new chapter for accounting students across Nigeria — building a community
              that learns, networks, and grows together. From the National E-Library to the annual
              convention, every initiative is shaped around your journey from classroom to chartered.
            </p>
          </div>
        </motion.div>

        <h2 className="font-serif text-2xl font-bold text-foreground mb-6">Other Executives</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {executives.map((exec, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="overflow-hidden h-full flex flex-col">
                <div className="aspect-[4/5] bg-muted relative overflow-hidden">
                  {exec.image_url ? (
                    <img
                      src={exec.image_url}
                      alt={`${exec.full_name} — ${exec.position}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-muted-foreground bg-muted">
                      <User className="w-16 h-16 opacity-40" />
                    </div>
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-serif font-bold text-lg text-foreground">
                    {exec.full_name || <span className="text-muted-foreground italic">Name TBA</span>}
                  </h3>
                  <p className="text-sm text-accent font-medium mb-2">{exec.position}</p>
                  {exec.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-4 mb-3">{exec.bio}</p>
                  )}
                  <div className="mt-auto space-y-1 text-xs text-muted-foreground">
                    {exec.email && (
                      <div className="flex items-center gap-2"><Mail className="w-3 h-3" /> {exec.email}</div>
                    )}
                    {exec.phone && (
                      <div className="flex items-center gap-2"><Phone className="w-3 h-3" /> {exec.phone}</div>
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
