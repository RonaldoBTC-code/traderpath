import Link from "next/link";
import type { MissionStatus } from "@/store/gameStore";

interface Props {
  status: MissionStatus;
}

export default function BitcoinCityMap({ status }: Props) {
  const canEnter = status !== "locked";

  return (
    <section className="overflow-hidden rounded-lg border border-orange-300/20 bg-[#18252b] shadow-[0_20px_70px_rgba(247,147,26,0.12)]">
      <div className="grid lg:grid-cols-[1.35fr_0.65fr]">
        <div className="relative min-h-[330px] overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#ffdca7] via-[#efaf68] to-[#9fc7b1]" />
          <div className="absolute inset-x-[-8%] bottom-[-26%] h-[82%] rounded-[50%] bg-[#6d9b54]" />
          <div className="absolute bottom-0 right-0 h-28 w-1/3 rounded-tl-[80%] bg-[#58a9bd]" />
          <div className="absolute bottom-8 left-[10%] h-20 w-24 rounded-t-2xl bg-[#f5deb2] shadow-xl">
            <div className="mx-auto -mt-7 h-12 w-16 rotate-45 rounded-md bg-[#d76848]" />
            <div className="mx-auto mt-5 h-8 w-5 rounded-t-full bg-[#714a35]" />
          </div>
          <div className="absolute bottom-16 left-[46%] h-28 w-28 rounded-t-[2rem] bg-[#e7a13b] shadow-xl">
            <div className="mx-auto mt-7 flex h-14 w-14 items-center justify-center rounded-full bg-[#fff7df] font-data text-3xl font-bold text-[#F7931A]">₿</div>
          </div>
          <div className="absolute bottom-7 right-[12%] h-14 w-28 rounded-full bg-[#496f81] shadow-xl">
            <div className="mx-auto mt-3 h-2 w-20 rounded-full bg-[#91d7e8]" />
          </div>
          <div className="absolute bottom-[-14px] left-[38%] h-52 w-7 -rotate-[58deg] rounded-full bg-[#ead7aa]" />

          <div className="absolute left-[8%] top-[40%] rounded-full border-2 border-white bg-[#F7931A] px-3 py-1 font-data text-[10px] font-bold text-white shadow-lg">
            1 · Genesis
          </div>
          <div className="absolute left-[48%] top-[30%] rounded-full border-2 border-white bg-[#F0C040] px-3 py-1 font-data text-[10px] font-bold text-[#392a12] shadow-lg">
            2 · Bloques
          </div>
          <div className="absolute bottom-[16%] right-[7%] rounded-full border-2 border-white bg-[#60A5FA] px-3 py-1 font-data text-[10px] font-bold text-white shadow-lg">
            4 · Lightning
          </div>

          <div className="absolute left-5 top-5 max-w-xs rounded-md border border-white/20 bg-[#162029]/80 p-4 backdrop-blur">
            <p className="text-[10px] uppercase tracking-[0.2em] text-orange-300">Ruta cripto · acceso obligatorio</p>
            <h2 className="mt-1 font-display text-2xl font-bold text-white">Ciudad Origen: Bitcoin</h2>
            <p className="mt-1 text-xs leading-relaxed text-white/70">Explora primero el sistema que dio origen al ecosistema. Después se abre el mercado cripto.</p>
          </div>
        </div>

        <div className="flex flex-col justify-between border-t border-white/10 bg-[#111a21] p-6 lg:border-l lg:border-t-0">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-tp-crypto">Objetivo actual</p>
            <h3 className="mt-2 font-display text-xl font-bold">Comprender antes de operar</h3>
            <p className="mt-2 text-sm leading-relaxed text-tp-text-muted">
              Recorre Genesis, el Taller de Bloques, la Casa de Custodia y el Puente Lightning. No se usa dinero real ni se solicita ninguna clave.
            </p>
            <ul className="mt-5 space-y-2 text-xs text-tp-text">
              <li>✓ Diferenciar Bitcoin, bitcoin y BTC</li>
              <li>✓ Entender nodos, mineros y consenso</li>
              <li>✓ Practicar autocustodia segura</li>
              <li>✓ Separar tecnología de especulación</li>
            </ul>
          </div>

          {canEnter ? (
            <Link href="/mission/m3c_0" className="mt-6 rounded-sm bg-tp-crypto px-5 py-3 text-center font-display font-bold text-white transition hover:brightness-110">
              Entrar a Ciudad Origen →
            </Link>
          ) : (
            <p className="mt-6 rounded-sm border border-tp-border bg-tp-base px-4 py-3 text-center text-xs text-tp-text-muted">
              Completa el Gran Tour y elige la ruta cripto.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

