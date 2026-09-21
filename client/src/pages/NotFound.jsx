import { Link } from "react-router-dom";
import { ArrowLeft, Home as HomeIcon } from "lucide-react";
import Navbar from "../components/Navbar.jsx";

export default function NotFound() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f3f8f5]">
      <Navbar />

      <div className="relative flex min-h-[calc(100vh-84px)] items-center justify-center px-5 py-10 sm:px-6">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-primary/[0.08] blur-3xl" />
          <div className="absolute -bottom-48 -right-32 h-[32rem] w-[32rem] rounded-full bg-accent/[0.05] blur-3xl" />
        </div>

        <main className="relative z-10 w-full max-w-4xl">
          <section className="grid overflow-hidden rounded-[2rem] border border-white/80 bg-white/65 shadow-[0_28px_90px_rgba(15,23,42,0.10)] backdrop-blur-2xl lg:grid-cols-[1.05fr_.95fr]">
            {/* Illustration */}
            <div className="flex items-center justify-center bg-[#eef5f1] px-5 py-10 sm:px-10 lg:min-h-[620px]">
              <div className="error-scene">
                <div className="error-404">404</div>

                <div className="error-tv-wrap">
                  <div className="error-antenna">
                    <div className="error-antenna-shadow" />
                    <div className="error-a1" />
                    <div className="error-a1d" />
                    <div className="error-a2" />
                    <div className="error-a2d" />
                    <div className="error-a-base" />
                  </div>

                  <div className="error-tv">
                    <div className="error-display">
                      <div className="error-screen-shell">
                        <div className="error-screen">
                          <span>NOT FOUND</span>
                        </div>

                        <div className="error-screen-mobile">
                          <span>NOT FOUND</span>
                        </div>
                      </div>
                    </div>

                    <div className="error-lines">
                      <div className="error-line-small" />
                      <div className="error-line-large" />
                      <div className="error-line-small" />
                    </div>

                    <div className="error-buttons">
                      <div className="error-button error-button-one">
                        <div />
                      </div>
                      <div className="error-button error-button-two" />

                      <div className="error-speakers">
                        <div className="error-speaker-row">
                          <div />
                          <div />
                          <div />
                        </div>
                        <div className="error-speaker-line" />
                        <div className="error-speaker-line" />
                      </div>
                    </div>
                  </div>

                  <div className="error-bottom">
                    <div />
                    <div />
                    <div />
                  </div>
                </div>
              </div>
            </div>

            {/* Message */}
            <div className="flex flex-col justify-center bg-white/80 p-7 sm:p-10 lg:p-12">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/10 bg-primary/[0.05] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                KapHealth · 404
              </div>

              <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                This page took
                <span className="block text-primary">a wrong turn.</span>
              </h1>

              <p className="mt-4 max-w-md text-sm leading-6 text-slate-500 sm:text-[15px]">
                The page you’re looking for doesn’t exist, may have moved, or
                the link is no longer valid. Let’s get you back to the
                healthcare journey.
              </p>

              <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
                <Link
                  to="/"
                  className="group flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-gradient-to-b from-white via-white to-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 shadow-[0_4px_3px_rgba(255,255,255,.7),0_7px_16px_rgba(148,163,184,.30),0_-3px_4px_rgba(206,207,209,.45)] transition-all duration-200 hover:-translate-y-0.5 hover:text-primary hover:shadow-[0_5px_4px_rgba(255,255,255,.75),0_10px_22px_rgba(148,163,184,.36),0_-4px_5px_rgba(206,207,209,.45)] active:translate-y-0"
                >
                  <HomeIcon size={16} className="text-primary" />
                  Back to home
                  <span className="transition-transform duration-300 group-hover:translate-x-0.5">
                    →
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/70 px-5 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-900"
                >
                  <ArrowLeft size={15} />
                  Go back
                </button>
              </div>

              <div className="mt-8 flex items-center gap-2 text-[10px] font-medium text-slate-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Secure KapHealth application
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                Error 404
              </div>
            </div>
          </section>
        </main>
      </div>

      <style>{`
        .error-scene {
          position: relative;
          width: min(100%, 390px);
          height: 470px;
          display: flex;
          align-items: center;
          justify-content: center;
          perspective: 1000px;
        }

        .error-tv-wrap {
          position: relative;
          z-index: 2;
          width: 300px;
          height: 330px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transform: translateY(20px) rotate(-1deg);
          transition: transform 0.5s cubic-bezier(.22,1,.36,1);
        }

        .error-scene:hover .error-tv-wrap {
          transform: translateY(4px) rotate(0deg) scale(1.02);
        }

        .error-404 {
          position: absolute;
          z-index: 0;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(15, 110, 91, 0.065);
          font-family: Arial, sans-serif;
          font-size: 220px;
          font-weight: 900;
          letter-spacing: -0.12em;
          transform: translateY(20px) scaleY(1.15);
          user-select: none;
        }

        .error-antenna {
          position: relative;
          z-index: 0;
          width: 72px;
          height: 72px;
          margin-bottom: -76px;
          border-radius: 50%;
          border: 2px solid #17231f;
          background: linear-gradient(145deg, #4da58d, #0f6e5b);
          box-shadow: 0 10px 18px rgba(15, 110, 91, .18);
        }

        .error-antenna::before,
        .error-antenna::after {
          content: "";
          position: absolute;
          border-radius: 50%;
          background: #a8d8cb;
        }

        .error-antenna::before {
          width: 22px;
          height: 11px;
          margin-top: 3px;
          margin-left: 18px;
          transform: rotate(-20deg);
        }

        .error-antenna::after {
          width: 15px;
          height: 8px;
          margin-top: -26px;
          margin-left: 6px;
          transform: rotate(-25deg);
        }

        .error-antenna-shadow {
          position: absolute;
          width: 42px;
          height: 48px;
          margin-left: 24px;
          margin-top: 18px;
          border-radius: 45%;
          border: 4px solid transparent;
          transform: rotate(140deg);
          box-shadow: inset 0 16px #0a4d41;
        }

        .error-a1,
        .error-a2 {
          position: absolute;
          width: 150px;
          height: 64px;
          border-radius: 50px;
          background: linear-gradient(#13201c, #30443e, #13201c);
        }

        .error-a1 {
          top: -47px;
          left: -90px;
          clip-path: polygon(50% 0%, 49% 100%, 52% 100%);
          transform: rotate(-29deg);
        }

        .error-a2 {
          top: -47px;
          right: -91px;
          clip-path: polygon(47% 0, 47% 0, 34% 34%, 54% 25%, 32% 100%, 29% 96%, 49% 32%, 30% 38%);
          transform: rotate(-8deg);
        }

        .error-a1d,
        .error-a2d {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          border: 2px solid #17231f;
          background: #a7aaa9;
          z-index: 5;
        }

        .error-a1d {
          top: -45px;
          left: -45px;
        }

        .error-a2d {
          top: -62px;
          right: -29px;
        }

        .error-a-base {
          position: absolute;
          left: 50%;
          top: 46px;
          width: 12px;
          height: 12px;
          margin-left: -6px;
          border-radius: 50%;
          background: #7a8f89;
          box-shadow: inset 1px 1px 1px #becac6;
        }

        .error-tv {
          position: relative;
          width: 280px;
          height: 148px;
          margin-top: 34px;
          border-radius: 16px;
          border: 2px solid #17231f;
          background: linear-gradient(145deg, #2c6d5e, #0e4e43);
          box-shadow:
            inset 4px 4px rgba(255,255,255,.12),
            0 18px 30px rgba(15,23,42,.18);
          display: flex;
          justify-content: center;
          padding-top: 8px;
        }

        .error-tv::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 16px;
          background:
            repeating-radial-gradient(#0f6e5b 0 0.0001%, #00000040 0 0.0002%) 50% 0 / 1100px 1100px,
            repeating-conic-gradient(#0f6e5b 0 0.0001%, #00000040 0 0.0002%) 60% 60% / 1100px 1100px;
          background-blend-mode: difference;
          opacity: .08;
          pointer-events: none;
        }

        .error-display {
          display: flex;
          align-self: center;
          justify-content: center;
          align-items: center;
          width: 194px;
          height: 122px;
          border-radius: 13px;
          box-shadow: 4px 4px 0 rgba(255,255,255,.10);
        }

        .error-screen-shell {
          width: 184px;
          height: 112px;
          border-radius: 11px;
          overflow: hidden;
          border: 2px solid #17231f;
          background: #07110e;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .error-screen,
        .error-screen-mobile {
          width: 160px;
          height: 96px;
          border-radius: 8px;
          border: 2px solid #0b1411;
          background:
            linear-gradient(120deg, #163c35, #07110e 42%, #174c40 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: inset 0 0 28px rgba(0,0,0,.45);
          animation: error-flicker .16s infinite alternate;
        }

        .error-screen-mobile {
          display: none;
        }

        .error-screen span,
        .error-screen-mobile span {
          padding: 5px 8px;
          border-radius: 6px;
          background: #07110e;
          color: #d7f4ec;
          font-family: Arial, sans-serif;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .16em;
          box-shadow: 0 0 18px rgba(95, 194, 166, .08);
        }

        .error-lines {
          position: absolute;
          right: 19px;
          bottom: -27px;
          width: 8px;
          display: flex;
          align-items: flex-end;
          column-gap: 2px;
        }

        .error-line-small,
        .error-line-large {
          width: 2px;
          border-radius: 25px 25px 0 0;
          background: #17231f;
        }

        .error-line-small {
          height: 8px;
        }

        .error-line-large {
          height: 16px;
        }

        .error-buttons {
          position: absolute;
          right: 8px;
          top: 27px;
          width: 54px;
          height: 94px;
          border-radius: 10px;
          border: 2px solid #17231f;
          background: #7aa79c;
          padding: 8px 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          row-gap: 7px;
          box-shadow: 3px 3px rgba(15,110,91,.20);
        }

        .error-button {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #385951;
          border: 2px solid #17231f;
          box-shadow:
            inset 2px 2px 1px #6e9188,
            -2px 0 #223b35;
        }

        .error-button-one::before,
        .error-button-one::after,
        .error-button-one div,
        .error-button-two::before,
        .error-button-two::after {
          content: "";
          position: absolute;
          background: #101715;
          border-radius: 5px;
        }

        .error-button-one::before {
          width: 2px;
          height: 7px;
          transform: translate(7px, 8px) rotate(47deg);
        }

        .error-button-one::after {
          width: 2px;
          height: 9px;
          transform: translate(10px, 7px) rotate(47deg);
        }

        .error-button-one div {
          width: 2px;
          height: 20px;
          transform: translate(8px, 1px) rotate(45deg);
        }

        .error-button-two::before {
          width: 2px;
          height: 8px;
          transform: translate(6px, 8px) rotate(-45deg);
        }

        .error-button-two::after {
          width: 2px;
          height: 20px;
          transform: translate(8px, 1px) rotate(-45deg);
        }

        .error-speakers {
          display: flex;
          flex-direction: column;
          row-gap: 6px;
        }

        .error-speaker-row {
          display: flex;
          column-gap: 4px;
        }

        .error-speaker-row div {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #385951;
          border: 1px solid #17231f;
          box-shadow: inset 1px 1px 1px #87aaa1;
        }

        .error-speaker-line {
          width: 22px;
          height: 2px;
          background: #17231f;
        }

        .error-bottom {
          position: absolute;
          bottom: -10px;
          left: 50%;
          width: 280px;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 34px;
        }

        .error-bottom > div {
          height: 15px;
          width: 34px;
          border: 2px solid #17231f;
          background: #556661;
        }

        .error-bottom > div:last-child {
          position: absolute;
          left: 50%;
          width: 246px;
          height: 3px;
          margin-left: -123px;
          margin-top: 11px;
          border: 0;
          background: #17231f;
        }

        @keyframes error-flicker {
          from { background-position: 0 0; }
          to { background-position: 4px -3px; }
        }

        @media (max-width: 1024px) {
          .error-scene {
            transform: scale(.88);
          }

          .error-screen {
            display: none;
          }

          .error-screen-mobile {
            display: flex;
          }
        }

        @media (max-width: 520px) {
          .error-scene {
            height: 390px;
            transform: scale(.72);
            transform-origin: center;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .error-tv-wrap,
          .error-screen,
          .error-screen-mobile {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}
