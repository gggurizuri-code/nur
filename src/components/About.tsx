import { ArrowLeft } from 'lucide-react';

interface AboutProps {
  onNavigate: (page: string) => void;
}

export default function About({ onNavigate }: AboutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center space-x-2 text-slate-700 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Назад на главную</span>
        </button>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-slate-800 mb-8">О проекте и справка</h1>

          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">О проекте</h2>
            <p className="text-slate-700 mb-4">
              Динамика.Lab — это образовательная платформа для изучения основ динамики и механики
              через интерактивные симуляции. Все материалы доступны бесплатно и не требуют
              регистрации.
            </p>
            <p className="text-slate-700">
              Платформа предназначена для урока. Создатели: Нұр и Ақерке.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Основные формулы</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Маятник</h3>
                <div className="bg-slate-50 p-4 rounded-lg font-mono text-sm">
                  <p className="mb-2">T = 2π√(L/g)</p>
                  <p className="text-slate-600 text-xs font-sans">
                    где T — период, L — длина, g — ускорение свободного падения
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Баллистическое движение</h3>
                <div className="bg-slate-50 p-4 rounded-lg font-mono text-sm space-y-2">
                  <p>x = v₀ cos(α) · t</p>
                  <p>y = v₀ sin(α) · t - ½gt²</p>
                  <p>R = v₀² sin(2α) / g</p>
                  <p className="text-slate-600 text-xs font-sans">
                    где R — дальность полёта, v₀ — начальная скорость, α — угол
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Столкновение тел</h3>
                <div className="bg-slate-50 p-4 rounded-lg font-mono text-sm space-y-2">
                  <p>m₁v₁ + m₂v₂ = m₁v₁' + m₂v₂'</p>
                  <p>v₁' = [(m₁ - em₂)v₁ + m₂(1+e)v₂] / (m₁+m₂)</p>
                  <p>v₂' = [(m₂ - em₁)v₂ + m₁(1+e)v₁] / (m₁+m₂)</p>
                  <p className="text-slate-600 text-xs font-sans">
                    где e — коэффициент восстановления (0 ≤ e ≤ 1)
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Энергия</h3>
                <div className="bg-slate-50 p-4 rounded-lg font-mono text-sm space-y-2">
                  <p>Eₖ = ½mv²</p>
                  <p>Eₚ = mgh</p>
                  <p>E = Eₖ + Eₚ = const</p>
                  <p className="text-slate-600 text-xs font-sans">
                    кинетическая, потенциальная и полная механическая энергия
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Круговое движение</h3>
                <div className="bg-slate-50 p-4 rounded-lg font-mono text-sm space-y-2">
                  <p>Fц = mv²/R = mω²R</p>
                  <p>a = v²/R = ω²R</p>
                  <p className="text-slate-600 text-xs font-sans">
                    центростремительная сила и ускорение
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Физические константы</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold text-slate-800 mb-1">Ускорение свободного падения</h4>
                <p className="font-mono text-lg text-blue-600">g = 9.81 м/с²</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold text-slate-800 mb-1">Масштаб симуляции</h4>
                <p className="font-mono text-lg text-blue-600">1 м = 50 пикселей</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Советы по работе</h2>
            <ul className="space-y-3 text-slate-700">
              <li className="flex items-start space-x-3">
                <span className="text-blue-600 font-bold mt-0.5">•</span>
                <span>Начинайте с простых экспериментов и постепенно усложняйте параметры</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-blue-600 font-bold mt-0.5">•</span>
                <span>Используйте инструменты измерения для проверки теоретических формул</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-blue-600 font-bold mt-0.5">•</span>
                <span>Включайте графики для визуализации изменения физических величин</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-blue-600 font-bold mt-0.5">•</span>
                <span>Изменяйте скорость времени для лучшего наблюдения за процессами</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-blue-600 font-bold mt-0.5">•</span>
                <span>Сравнивайте результаты экспериментов с расчётами по формулам</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
