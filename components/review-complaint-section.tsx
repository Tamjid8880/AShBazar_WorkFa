"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user: { name: string };
}

interface ReviewSectionProps {
  productId: string;
  productName: string;
}

export default function ReviewAndComplaintSection({ productId, productName }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [compSubject, setCompSubject] = useState("");
  const [compDesc, setCompDesc] = useState("");
  const [compSubmitting, setCompSubmitting] = useState(false);
  const [compSubmitted, setCompSubmitted] = useState(false);

  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("auth_user") || "null") : null;

  useEffect(() => {
    fetch(`/api/reviews?productId=${productId}`)
      .then(r => r.json())
      .then(d => setReviews(d.data || []));
  }, [productId, submitted]);

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!user) { alert("Please login to submit a review."); return; }
    setSubmitting(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, userId: user.id, rating, comment })
    });
    setSubmitting(false);
    if (res.ok) { setSubmitted(true); setComment(""); setRating(5); }
  }

  async function submitComplaint(e: React.FormEvent) {
    e.preventDefault();
    if (!user) { alert("Please login to file a complaint."); return; }
    setCompSubmitting(true);
    const res = await fetch("/api/complaints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, subject: compSubject, description: compDesc })
    });
    setCompSubmitting(false);
    if (res.ok) { setCompSubmitted(true); setCompSubject(""); setCompDesc(""); }
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="space-y-8">
      {/* ===== REVIEWS ===== */}
      <div className="rounded-[32px] border border-slate-100 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Customer Reviews</h2>
            {avgRating && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-4xl font-black text-slate-900">{avgRating}</span>
                <div>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <span key={s} className={`text-lg ${Number(avgRating) >= s ? "text-amber-400" : "text-slate-200"}`}>★</span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 font-bold">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Review list */}
        {reviews.length === 0 ? (
          <div className="bg-slate-50 rounded-2xl p-8 text-center">
            <p className="text-slate-400 font-bold">No reviews yet. Be the first to review!</p>
          </div>
        ) : (
          <div className="space-y-4 mb-8">
            {reviews.map(r => (
              <div key={r.id} className="bg-slate-50 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <span key={s} className={`text-sm ${r.rating >= s ? "text-amber-400" : "text-slate-200"}`}>★</span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 font-bold">{new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
                <p className="font-black text-slate-900 text-sm mt-1">{r.user.name}</p>
                {r.comment && <p className="text-slate-600 text-sm mt-2 leading-relaxed">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Submit review form */}
        {submitted ? (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 text-center">
            <p className="text-emerald-700 font-black">✓ Review submitted! Thank you.</p>
          </div>
        ) : (
          <form onSubmit={submitReview} className="border-t border-slate-100 pt-6 space-y-4">
            <h3 className="font-black text-slate-900 text-lg">Write a Review</h3>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Your Rating</label>
              <div className="flex gap-2 mt-2">
                {[1,2,3,4,5].map(s => (
                  <button key={s} type="button" onClick={() => setRating(s)}
                    className={`text-3xl transition-transform hover:scale-110 ${rating >= s ? "text-amber-400" : "text-slate-200"}`}>★</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Comment (optional)</label>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                className="w-full mt-2 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-orange-500/10"
                rows={3}
                placeholder="Share your experience with this product..."
              />
            </div>
            <button type="submit" disabled={submitting}
              className="w-full bg-slate-900 text-white py-3 rounded-2xl font-black text-sm hover:bg-slate-800 transition disabled:opacity-50">
              {submitting ? "SUBMITTING..." : "SUBMIT REVIEW"}
            </button>
          </form>
        )}
      </div>

      {/* ===== COMPLAINT ===== */}
      <div className="rounded-[32px] bg-slate-900 p-8 text-white shadow-xl">
        <h3 className="text-xl font-black mb-1">Have an Issue?</h3>
        <p className="text-slate-400 text-sm mb-6">
          File a complaint about <span className="text-orange-400 font-bold">{productName}</span> or any other issue — our team will respond promptly.
        </p>
        {compSubmitted ? (
          <div className="bg-emerald-600/20 border border-emerald-500/30 rounded-2xl p-5 text-center">
            <p className="text-emerald-400 font-black">✓ Complaint filed! We'll get back to you. A ticket ID has been generated.</p>
          </div>
        ) : (
          <form onSubmit={submitComplaint} className="space-y-4">
            <input
              value={compSubject}
              onChange={e => setCompSubject(e.target.value)}
              placeholder="Subject (e.g. Wrong item delivered)"
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-3 text-sm font-bold text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
            <textarea
              value={compDesc}
              onChange={e => setCompDesc(e.target.value)}
              placeholder="Describe your issue in detail..."
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-3 text-sm font-bold text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-orange-500"
              rows={4}
              required
            />
            <button type="submit" disabled={compSubmitting}
              className="w-full bg-orange-600 py-3 rounded-2xl font-black text-sm hover:bg-orange-700 transition disabled:opacity-50">
              {compSubmitting ? "FILING..." : "FILE COMPLAINT"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
