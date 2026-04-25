import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getStoreNavData } from "@/lib/store-nav";
import StoreHeader from "@/components/store-header";
import StoreFooter from "@/components/store-footer";
import EcoProductCard from "@/components/eco-product-card";
import HeroCarousel from "@/components/hero-carousel";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "AshBazar — Fresh Grocery Store | Best Prices Delivered",
  description: "Shop fresh vegetables, fruits, meat, dairy and more at AshBazar.",
};

const ChevronRight = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

const TruckIcon  = () => <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
const ShieldIcon = () => <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const HsetIcon   = () => <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M3 18v-6a9 9 0 0118 0v6"/><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/></svg>;
const ReturnIcon = () => <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>;

export default async function HomePage() {
  const { categories, brands, settings } = await getStoreNavData();

  // Fetch dynamic widgets for sections
  const widgets = await prisma.widget.findMany();
  const heroPosters = widgets.filter(w => w.section === "hero_carousel");
  const hotDealsBanner = widgets.find(w => w.section === "hot_deals");
  const specialOfferBanner = widgets.find(w => w.section === "special_offer");
  const secondaryBanners = widgets.filter(w => w.section === "secondary_banner");
  const whyChooseUsWidget = widgets.find(w => w.section === "why_choose_us");

  const testimonials = await prisma.testimonial.findMany({ take: 3, orderBy: { createdAt: "desc" } });

  const hotDeals = await prisma.product.findMany({
    where:   { isHotDeal: true, isHidden: false },
    include: { category: true, variants: true },
    take:    8,
  });

  const specialOffers = await prisma.product.findMany({
    where:   { isSpecialOffer: true, isHidden: false },
    include: { category: true, variants: true },
    take:    8,
  });

  const featuredProducts = await prisma.product.findMany({
    take:    12,
    where:   { isHidden: false },
    orderBy: { createdAt: "desc" },
    include: { category: true, variants: true },
  });

  const latestProducts = await prisma.product.findMany({
    take:    4,
    where:   { isHotDeal: false, isSpecialOffer: false, isHidden: false },
    orderBy: { createdAt: "desc" },
    include: { category: true, variants: true },
  });

  const promoBanner1 = secondaryBanners[0] || null;
  const promoBanner2 = secondaryBanners[1] || null;

  return (
    <div className="min-h-screen bg-[#f5f7f5]">
      <StoreHeader categories={categories} brands={brands} settings={settings} />

      {/* ── HERO CAROUSEL ──────────────────────────────────── */}
      <HeroCarousel posters={heroPosters} />

      {/* ── FEATURE BADGES ─────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="container-main py-5">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { icon: <TruckIcon />,  title: "Free Shipping",  sub: "Orders over ৳500" },
              { icon: <ShieldIcon />, title: "100% Secure",    sub: "Safe payment" },
              { icon: <HsetIcon />,   title: "24/7 Support",   sub: "Dedicated support" },
              { icon: <ReturnIcon />, title: "Easy Returns",   sub: "10-day return policy" },
            ].map(f => (
              <div key={f.title} className="flex items-center gap-3 rounded-lg p-3">
                <div className="shrink-0 rounded-full bg-[#e8f5e9] p-2.5 text-[#2e7d32]">{f.icon}</div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{f.title}</p>
                  <p className="text-xs text-gray-500">{f.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ─────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="section-py bg-[#f5f7f5]">
          <div className="container-main">
            <div className="mb-8 text-center">
              <p className="section-label mb-1">CATEGORIES</p>
              <h2 className="section-title">Shop By Categories</h2>
            </div>
            <div className="flex flex-wrap justify-center gap-3 md:gap-4">
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.id}`}
                  className="category-pill group min-w-[80px] hover:bg-white rounded-lg transition"
                >
                  <div className="category-pill-icon group-hover:border-[#4caf50] group-hover:shadow-sm">
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="h-10 w-10 object-contain" />
                    ) : (
                      <span className="text-xl font-bold text-[#4caf50]">{cat.name[0]}</span>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-gray-700 group-hover:text-[#2e7d32] transition">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── HOT DEALS SECTION ──────────────────────────────── */}
      {hotDeals.length > 0 && (
        <section className="section-py bg-white">
          <div className="container-main">

            {/* Optional promo image strip above hot deals */}
            {hotDealsBanner && hotDealsBanner.imageUrl && (
              <div className="mb-6 overflow-hidden rounded-2xl shadow-sm">
                <img
                  src={hotDealsBanner.imageUrl}
                  alt={hotDealsBanner.title || "Hot Deals"}
                  className="h-44 w-full object-cover"
                />
              </div>
            )}

            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="section-label mb-1">
                  {hotDealsBanner?.meta && (hotDealsBanner.meta as any).discount ? `UP TO ${(hotDealsBanner.meta as any).discount}% OFF` : "EXCLUSIVE"}
                </p>
                <h2 className="section-title">{hotDealsBanner?.title || "Hot Deals"}</h2>
                {hotDealsBanner?.description && <p className="text-sm text-gray-500 mt-1">{hotDealsBanner.description}</p>}
              </div>
              <Link href="/shop?isHotDeal=1" className="flex items-center gap-1 text-sm font-semibold text-[#ff6f00] hover:text-[#e65100] transition">
                View All <ChevronRight />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {hotDeals.map(p => (
                <EcoProductCard
                  key={p.id} id={p.id} name={p.name}
                  price={p.price} offerPrice={p.offerPrice}
                  categoryName={p.category.name} images={p.images}
                  quantity={p.quantity} variants={p.variants} isHotDeal={true}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── PROMO BANNERS (using posters from DB) ──────────── */}
      <section className="py-10 bg-[#f5f7f5]">
        <div className="container-main">
          <div className="grid gap-6 md:grid-cols-2">

            {/* Left Banner */}
            <div
              className="group relative overflow-hidden rounded-2xl min-h-[200px] flex flex-col justify-between p-8 cursor-pointer"
              style={{
                background: promoBanner1
                  ? `linear-gradient(135deg, rgba(232,245,233,0.96) 40%, rgba(200,230,200,0.7) 100%)`
                  : "linear-gradient(135deg, #e8f5e9 40%, #c8e6c9 100%)",
                backgroundImage: promoBanner1
                  ? `linear-gradient(135deg, rgba(232,245,233,0.96) 40%, rgba(200,230,200,0.7) 100%), url(${promoBanner1.imageUrl})`
                  : undefined,
                backgroundSize:  "cover",
                backgroundPosition: "center right",
              }}
            >
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-[#4caf50]">
                  {promoBanner1?.meta && (promoBanner1.meta as any).discount ? `ENJOY ${(promoBanner1.meta as any).discount}% OFF` : "SPECIAL OFFER"}
                </p>
                <h3 className="mt-2 font-heading text-xl font-bold text-gray-900 leading-snug">
                  {promoBanner1?.title || "Free Fruits Are Collected From Gardens"}
                </h3>
                {promoBanner1?.description && <p className="mt-2 text-sm text-gray-600 max-w-[200px] line-clamp-3">{promoBanner1.description}</p>}
              </div>
              <Link
                href="/shop?isSpecialOffer=1"
                className="mt-4 inline-flex items-center rounded-md bg-[#ff6f00] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#e65100] transition w-fit"
              >
                Shop Now
              </Link>

              {/* Real image on right */}
              {promoBanner1 && promoBanner1.imageUrl && (
                <img
                  src={promoBanner1.imageUrl}
                  alt={promoBanner1.title || "Banner"}
                  className="absolute right-0 bottom-0 h-full w-1/2 object-cover object-left rounded-r-2xl opacity-80 group-hover:scale-105 transition duration-300"
                />
              )}
            </div>

            {/* Right Banner */}
            <div
              className="group relative overflow-hidden rounded-2xl min-h-[200px] flex flex-col justify-between p-8 cursor-pointer"
              style={{
                background: "linear-gradient(90deg, #8dc63f 0%, #3a753a 100%)",
              }}
            >
              {promoBanner2 && promoBanner2.imageUrl && (
                <img
                  src={promoBanner2.imageUrl}
                  alt={promoBanner2.title || "Banner"}
                  className="absolute inset-0 h-full w-full object-cover rounded-2xl opacity-40 group-hover:opacity-50 transition duration-300"
                />
              )}
              <div className="relative z-10">
                <p className="text-xs font-black uppercase tracking-widest text-[#a5d6a7]">
                  {promoBanner2?.meta && (promoBanner2.meta as any).discount ? `ENJOY ${(promoBanner2.meta as any).discount}% OFF` : "SPECIAL OFFER"}
                </p>
                <h3 className="mt-2 font-heading text-xl font-bold text-white leading-snug">
                  {promoBanner2?.title || "All Free Vegetables"}
                </h3>
                <p className="mt-1 text-xs text-white/70 leading-relaxed max-w-xs line-clamp-3">
                  {promoBanner2?.description || "There Is No One Who Loves Pain Itself, Who Seeks After It And Wants To Have It, Simply Because It Is Pain"}
                </p>
              </div>
              <Link
                href="/shop"
                className="relative z-10 mt-4 inline-flex items-center rounded-md bg-[#ff6f00] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#e65100] transition w-fit"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── SPECIAL OFFERS ─────────────────────────────────── */}
      {specialOffers.length > 0 && (
        <section className="section-py bg-[#f5f7f5]">
          <div className="container-main">

            {/* Optional image banner above special offers */}
            {specialOfferBanner && specialOfferBanner.imageUrl && (
              <div className="mb-6 overflow-hidden rounded-2xl shadow-sm">
                <img
                  src={specialOfferBanner.imageUrl}
                  alt={specialOfferBanner.title || "Special Offer"}
                  className="h-44 w-full object-cover"
                />
              </div>
            )}

            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="section-label mb-1">
                  {specialOfferBanner?.meta && (specialOfferBanner.meta as any).discount ? `ENJOY ${(specialOfferBanner.meta as any).discount}% OFF` : "PROMOTION"}
                </p>
                <h2 className="section-title">{specialOfferBanner?.title || "Special Offers"}</h2>
                {specialOfferBanner?.description && <p className="text-sm text-gray-500 mt-1">{specialOfferBanner.description}</p>}
              </div>
              <Link href="/shop?isSpecialOffer=1" className="flex items-center gap-1 text-sm font-semibold text-[#ff6f00] hover:text-[#e65100] transition">
                View All <ChevronRight />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {specialOffers.map(p => (
                <EcoProductCard
                  key={p.id} id={p.id} name={p.name}
                  price={p.price} offerPrice={p.offerPrice}
                  categoryName={p.category.name} images={p.images}
                  quantity={p.quantity} variants={p.variants} isSpecialOffer={true}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FEATURED / FREE SELLING ────────────────────────── */}
      <section className="section-py bg-white">
        <div className="container-main">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="section-label mb-1">FREE SELLING</p>
              <h2 className="section-title">Featured Products</h2>
            </div>
            <Link href="/shop" className="flex items-center gap-1 text-sm font-semibold text-[#ff6f00] hover:text-[#e65100] transition">
              View All <ChevronRight />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {featuredProducts.map(p => (
              <EcoProductCard
                key={p.id} id={p.id} name={p.name}
                price={p.price} offerPrice={p.offerPrice}
                categoryName={p.category.name} images={p.images}
                quantity={p.quantity} variants={p.variants}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ──────────────────────────────────── */}
      <section
        className="section-py"
        style={{ background: "linear-gradient(135deg, #1a2f1a 0%, #1c3a1c 40%, #2d5a2d 100%)" }}
      >
        <div className="container-main grid items-center gap-10 md:grid-cols-2">
          <div className="text-white">
            <p className="section-label mb-2 text-[#a5d6a7]">WHY CHOOSE US</p>
            <h2 className="font-heading text-3xl font-bold leading-snug">
              {whyChooseUsWidget?.title || "We Provide the Freshest &\nBest Quality Groceries"}
            </h2>
            <p className="mt-4 leading-relaxed text-white/70 text-sm">
              {whyChooseUsWidget?.description || "We source directly from farmers and trusted suppliers to bring you the freshest produce at the best prices."}
            </p>
            <ul className="mt-6 space-y-3">
              {["100% Fresh & Natural Products", "Direct from Farmers", "Fast & Safe Delivery", "Certified Organic Range"].map(item => (
                <li key={item} className="flex items-center gap-3 text-sm text-white/80">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#4caf50]">
                    <svg width="10" height="10" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/shop" className="mt-8 inline-flex items-center gap-2 rounded-md bg-[#ff6f00] px-6 py-3 text-sm font-semibold text-white hover:bg-[#e65100] transition">
              Shop Now <ChevronRight />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { num: whyChooseUsWidget?.meta && (whyChooseUsWidget.meta as any).totalProducts ? (whyChooseUsWidget.meta as any).totalProducts : "500+", lbl: "Products Available" },
              { num: whyChooseUsWidget?.meta && (whyChooseUsWidget.meta as any).totalCategories ? (whyChooseUsWidget.meta as any).totalCategories : "50+",  lbl: "Product Categories" },
              { num: whyChooseUsWidget?.meta && (whyChooseUsWidget.meta as any).happyCustomers ? (whyChooseUsWidget.meta as any).happyCustomers : "10K+", lbl: "Happy Customers" },
              { num: whyChooseUsWidget?.meta && (whyChooseUsWidget.meta as any).satisfactionRate ? `${(whyChooseUsWidget.meta as any).satisfactionRate}%` : "99%",  lbl: "Satisfaction Rate" },
            ].map(s => (
              <div key={s.lbl} className="rounded-xl bg-white/10 p-6 text-center backdrop-blur-sm">
                <p className="font-heading text-3xl font-bold text-white">{s.num}</p>
                <p className="mt-1 text-xs font-medium text-white/60">{s.lbl}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ───────────────────────────────────── */}
      {testimonials.length > 0 && (
        <section className="section-py bg-[#f5f7f5]">
          <div className="container-main">
            <div className="mb-8 text-center">
              <p className="section-label mb-1">TESTIMONIALS</p>
              <h2 className="section-title">What Our Customers Say</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map(t => (
                <div key={t.id} className="rounded-xl bg-white p-6 shadow-card">
                  <div className="mb-3 flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} width="14" height="14" fill={i < t.rating ? "#ff6f00" : "#e0e0e0"} viewBox="0 0 24 24">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed italic line-clamp-4">"{t.review}"</p>
                  <div className="mt-4 flex items-center gap-3 border-t border-gray-100 pt-4">
                    {t.imageUrl ? (
                      <img src={t.imageUrl} alt={t.name} className="h-9 w-9 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e8f5e9] text-sm font-bold text-[#2e7d32]">{t.name[0]}</div>
                    )}
                    <div>
                      <p className="text-sm font-bold text-gray-800">{t.name}</p>
                      <p className="text-xs text-gray-400">Verified Customer</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── LATEST PRODUCTS ────────────────────────────────── */}
      {latestProducts.length > 0 && (
        <section className="section-py bg-white">
          <div className="container-main">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="section-label mb-1">JUST IN</p>
                <h2 className="section-title">Latest Products</h2>
              </div>
              <Link href="/shop?sort=newest" className="flex items-center gap-1 text-sm font-semibold text-[#ff6f00] hover:text-[#e65100] transition">
                View All <ChevronRight />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              {latestProducts.map(p => (
                <EcoProductCard
                  key={p.id} id={p.id} name={p.name}
                  price={p.price} offerPrice={p.offerPrice}
                  categoryName={p.category.name} images={p.images}
                  quantity={p.quantity} variants={p.variants}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <StoreFooter settings={settings} />
    </div>
  );
}
