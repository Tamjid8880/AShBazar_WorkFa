import Link from "next/link";
import { getStoreNavData } from "@/lib/store-nav";
import StoreHeader from "@/components/store-header";
import StoreFooter from "@/components/store-footer";

export const metadata = {
  title: "Blog — AshBazar Grocery Store",
  description: "Read the latest news, tips, and recipes from AshBazar.",
};

export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";

const ChevronRight = () => (
  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

const UserIcon = () => (
  <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"/>
  </svg>
);

const HeartIcon = () => (
  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
  </svg>
);

// Generate a deterministic "image" bg for each post
const BG_COLORS = ["#e8f5e9","#fce4ec","#fff3e0","#ede7f6","#e3f2fd","#f3e5f5"];

export default async function BlogPage() {
  const { categories, brands, settings } = await getStoreNavData();
  const blogs = await prisma.blog.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="min-h-screen bg-[#f5f7f5]">
      <StoreHeader categories={categories} brands={brands} settings={settings} compact />

      {/* ── Page Banner ──────────────────────────────────────── */}
      <div className="bg-[#2e7d32] py-8">
        <div className="container-main">
          <h1 className="font-heading text-3xl font-bold text-white">Blog</h1>
          <nav className="breadcrumb mt-1">
            <Link href="/">Home</Link>
            <ChevronRight />
            <span className="text-white/60">Blog</span>
          </nav>
        </div>
      </div>

      {/* ── Blog Grid ─────────────────────────────────────────── */}
      <div className="container-main py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {blogs.map((post, idx) => (
            <article key={post.id} className="group overflow-hidden rounded-xl bg-white shadow-card hover:shadow-card-lg transition-all duration-200 hover:-translate-y-0.5 border border-gray-100 flex flex-col">
              {/* Image */}
              <div
                className="relative h-52 overflow-hidden flex-shrink-0"
                style={{ backgroundColor: BG_COLORS[idx % BG_COLORS.length] }}
              >
                {post.imageUrl ? (
                  <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                ) : (
                  <div className="flex h-full items-center justify-center text-6xl opacity-20 select-none">
                    🥦
                  </div>
                )}
                {/* Date badge */}
                <div className="absolute left-3 top-3 flex flex-col items-center justify-center rounded bg-[#2e7d32] px-2 py-1.5 text-center">
                  <span className="block text-lg font-black leading-none text-white">
                    {post.createdAt.getDate().toString().padStart(2, '0')}
                  </span>
                  <span className="block text-[10px] font-semibold uppercase text-white/80">
                    {post.createdAt.toLocaleString('default', { month: 'short' })}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col flex-1">
                {/* Author & likes */}
                <div className="mb-3 flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <UserIcon />
                    <span className="font-medium text-gray-500">Post By <span className="text-[#4caf50]">Admin</span></span>
                  </span>
                  <span className="flex items-center gap-1">
                    <HeartIcon />
                    <span>0</span>
                  </span>
                </div>

                <h2 className="text-base font-bold text-gray-800 line-clamp-2 group-hover:text-[#2e7d32] transition leading-snug">
                  {post.title}
                </h2>
                <p className="mt-2 text-sm text-gray-500 line-clamp-3 leading-relaxed flex-1">
                  {post.description}
                </p>

                <Link
                  href={`/blog/${post.id}`}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#ff6f00] hover:text-[#e65100] transition underline-offset-2 hover:underline"
                >
                  Read More <ChevronRight />
                </Link>
              </div>
            </article>
          ))}
          
          {blogs.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-500">
              No blog posts available yet. Check back soon!
            </div>
          )}
        </div>

        {/* ── Pagination ─────────────────────────────────────── */}
        <div className="mt-10 flex items-center justify-center gap-2">
          {[1, 2, 3].map(p => (
            <button
              key={p}
              className={`h-9 w-9 rounded-md border text-sm font-semibold transition ${
                p === 1
                  ? "border-[#4caf50] bg-[#4caf50] text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-[#4caf50] hover:text-[#4caf50]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <StoreFooter settings={settings} />
    </div>
  );
}
