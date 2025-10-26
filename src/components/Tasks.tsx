import { useState } from 'react';
import { ArrowLeft, CheckCircle2, XCircle, Info } from 'lucide-react';
import { Task } from '../types/physics';

interface TasksProps {
  onNavigate: (page: string) => void;
}

// --- helper: попытка получить последние измерения из лаборатории ---
// Ожидаемый формат, который записывает лаборатория:
// localStorage.setItem('lab_measurements', JSON.stringify({
//   experimentType: 'pendulum',
//   measurements: { period: 2.01, energy: {...}, ... }
// }));
function getLatestMeasurementsFor(experimentType: string) {
  try {
    // сначала локалсторедж
    const raw = localStorage.getItem('lab_measurements');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.experimentType === experimentType && parsed.measurements) {
        return parsed.measurements;
      }
    }
  } catch (e) {
    // ignore parse errors
  }

  // fallback: глобальная переменная (можете установить в Laboratory: window.__lab_measurements = {...})
  try {
    const g = (window as any).__lab_measurements;
    if (g && g.experimentType === experimentType && g.measurements) return g.measurements;
  } catch (e) {}

  return null;
}

// --- задачи ---
// Каждая задача содержит validation(measured) => { success, message }
const tasks: Task[] = [
  {
    id: '1',
    title: 'Период маятника',
    description: 'Установите длину маятника 1.00 м и проверьте, что период колебаний ~ 2.01 с (±0.1 с).',
    experimentType: 'pendulum',
    targetParams: { length: 1.0, expectedPeriod: 2.01, tolerance: 0.1 },
    validation: (measured) => {
      if (!measured || typeof measured.period !== 'number') {
        return { success: false, message: 'Нет измерения периода. Запустите экспериемент и измерьте период (measured.period).' };
      }
      const expected = 2.01;
      const tol = 0.1;
      const diff = Math.abs(measured.period - expected);
      if (diff <= tol) return { success: true, message: `Отлично! Период: ${measured.period.toFixed(2)} с (ожид. ${expected}±${tol})` };
      return { success: false, message: `Период ${measured.period.toFixed(2)} с — не в пределах ${expected}±${tol}. Попробуйте ещё раз (проверьте длину и начальный угол).` };
    },
  },
  {
    id: '2',
    title: 'Дальность полёта',
    description: 'Настройте начальную скорость и угол, чтобы получить дальность ≈ 40 м (±5 м).',
    experimentType: 'projectile',
    targetParams: { range: 40, tolerance: 5 },
    validation: (measured) => {
      if (!measured || typeof measured.range !== 'number') {
        return { success: false, message: 'Нет измерения дальности (measured.range). Запустите бросок и снимите дальность.' };
      }
      const expected = 40;
      const tol = 5;
      const diff = Math.abs(measured.range - expected);
      if (diff <= tol) return { success: true, message: `Отлично! Дальность: ${measured.range.toFixed(1)} м` };
      return { success: false, message: `Дальность ${measured.range.toFixed(1)} м не в пределах ${expected}±${tol} м — попробуйте изменить угол/скорость.` };
    },
  },
  {
    id: '3',
    title: 'Закон сохранения импульса',
    description: 'Проведите столкновение двух тел. Относительная ошибка суммарного импульса должна быть < 1%.',
    experimentType: 'collision',
    targetParams: { momentumErrorPct: 1 },
    validation: (measured) => {
      if (!measured || typeof measured.momentumBefore !== 'number' || typeof measured.momentumAfter !== 'number') {
        return { success: false, message: 'Не найдены импульсы до/после (measured.momentumBefore / measured.momentumAfter).' };
      }
      const before = measured.momentumBefore;
      const after = measured.momentumAfter;
      const err = Math.abs(after - before) / (Math.abs(before) + 1e-9);
      if (err <= 0.01) return { success: true, message: `Хорошо! Ошибка сохранения импульса ${(err*100).toFixed(2)}%` };
      return { success: false, message: `Ошибка ${(err*100).toFixed(2)}% > 1% — проверьте начальные скорости/массы или численную точность.` };
    },
  },
  {
    id: '4',
    title: 'Упругое столкновение — энергия',
    description: 'Настройте упругое столкновение (e≈1). Суммарная кинетическая энергия до/после должна отличаться < 2%.',
    experimentType: 'collision',
    targetParams: { energyErrorPct: 2, restitutionMin: 0.95 },
    validation: (measured) => {
      if (!measured || typeof measured.energyBefore !== 'number' || typeof measured.energyAfter !== 'number') {
        return { success: false, message: 'Нет измерений энергии (measured.energyBefore / measured.energyAfter).' };
      }
      const err = Math.abs(measured.energyAfter - measured.energyBefore) / (measured.energyBefore + 1e-9);
      const restitution = measured.restitution ?? 0;
      if (err <= 0.02 && restitution >= 0.95) {
        return { success: true, message: `Отлично! Потеря энергии ${(err*100).toFixed(2)}%, e=${restitution.toFixed(2)}` };
      }
      return { success: false, message: `Потеря энергии ${(err*100).toFixed(2)}% или e=${restitution.toFixed(2)} — ожидается <2% и e≈1.` };
    },
  },
  {
    id: '5',
    title: 'Оптимальный угол для дальности',
    description: 'При начальной скорости 20 м/с найдите угол, дающий максимальную дальность (ожидаемо ≈45° без сопротивления).',
    experimentType: 'projectile',
    targetParams: { velocity: 20, optimalAngle: 45, toleranceDeg: 5 },
    validation: (measured) => {
      if (!measured || typeof measured.angle !== 'number' || typeof measured.range !== 'number' || typeof measured.velocity !== 'number') {
        return { success: false, message: 'Нужны измерения angle, range и velocity.' };
      }
      if (Math.abs(measured.velocity - 20) > 1e-6) {
        return { success: false, message: `Установите скорость в 20 м/с. Сейчас velocity=${measured.velocity}` };
      }
      // здесь предполагается, что пользователь исследовал несколько значений угла и выбрал лучший — но мы валидируем его результат
      const diff = Math.abs(measured.angle - 45);
      if (diff <= 5) return { success: true, message: `Хорошо! Угол ${measured.angle}° дает дальность ${measured.range.toFixed(1)} м` };
      return { success: false, message: `Угол ${measured.angle}° далеко от ожидаемого ~45°. Попробуйте 35–55° и найдите максимум.` };
    },
  },
  {
    id: '6',
    title: 'Влияние массы на период маятника',
    description: 'При одинаковой длине проверьте, что период не зависит от массы (относительная разница <5%).',
    experimentType: 'pendulum',
    targetParams: { length: 2.0, relTolerance: 0.05 },
    validation: (measured) => {
      // ожидаем measured.massPeriods = [{mass: 0.5, period: 2.83}, {mass: 2.0, period: 2.82}] или поля mass1Period/mass2Period
      const p1 = measured.mass1Period ?? (measured.massPeriods && measured.massPeriods[0] && measured.massPeriods[0].period);
      const p2 = measured.mass2Period ?? (measured.massPeriods && measured.massPeriods[1] && measured.massPeriods[1].period);
      if (typeof p1 !== 'number' || typeof p2 !== 'number') {
        return { success: false, message: 'Требуются два измерения периодов для разных масс (mass1Period, mass2Period или massPeriods).' };
      }
      const diff = Math.abs(p1 - p2);
      const avg = (p1 + p2) / 2;
      if (diff / avg < 0.05) return { success: true, message: `Верно — периоды ${p1.toFixed(2)} с и ${p2.toFixed(2)} с практически равны.` };
      return { success: false, message: `Периоды отличаются существенно: ${p1.toFixed(2)} vs ${p2.toFixed(2)}.` };
    },
  },
];

export default function Tasks({ onNavigate }: TasksProps) {
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  const handleTaskComplete = (taskId: string) => {
    setCompletedTasks((prev) => new Set([...prev, taskId]));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <button onClick={() => onNavigate('home')} className="flex items-center space-x-2 text-slate-700 hover:text-slate-900 mb-6 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span>Назад на главную</span>
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Практические задания</h1>
          <p className="text-slate-600">Выполните задания в лаборатории и проверьте свои результаты</p>
          <div className="mt-4 flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm text-slate-700">Выполнено: {completedTasks.size} / {tasks.length}</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => {
            const isCompleted = completedTasks.has(task.id);
            const experimentNames: Record<string, string> = { pendulum: 'Маятник', projectile: 'Проекция', collision: 'Столкновение' };

            return (
              <div key={task.id} className={`bg-white rounded-xl shadow-lg p-6 border-2 transition-all ${isCompleted ? 'border-green-400 bg-green-50' : 'border-transparent hover:shadow-xl'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="text-xs text-blue-600 font-medium mb-1">{experimentNames[task.experimentType] || task.experimentType}</div>
                    <h3 className="text-lg font-semibold text-slate-800">{task.title}</h3>
                  </div>
                  {isCompleted && <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 ml-2" />}
                </div>

                <p className="text-sm text-slate-600 mb-4">{task.description}</p>

                <div className="bg-blue-50 border-l-4 border-blue-600 p-3 rounded mb-4">
                  <div className="flex items-start space-x-2">
                    <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-slate-700">
                      <div className="font-semibold mb-1">Целевые параметры:</div>
                      <div className="space-y-1">
                        {Object.entries(task.targetParams).map(([key, value]) => (
                          <div key={key}>{key}: {typeof value === 'number' ? Number(value).toFixed(2) : String(value)}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button onClick={() => onNavigate('laboratory')} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                    Открыть в лаборатории
                  </button>

                  {!isCompleted && (
                    <button onClick={() => {
                      // пробуем взять реальные измерения
                      const measured = getLatestMeasurementsFor(task.experimentType);

                      if (!measured) {
                        // если нет — спросим пользователя / используем mock для разработки
                        const useMock = confirm('Не найдены реальные измерения из лаборатории. Использовать тестовые (mock) данные для проверки?');
                        if (!useMock) return;
                      }

                      const measurementToUse = measured ?? ((): any => {
                        // старый mock (как у вас раньше) — полезно для разработки
                        if (task.experimentType === 'pendulum') {
                          return { period: 2.05, mass1Period: 2.83, mass2Period: 2.81 };
                        }
                        if (task.experimentType === 'projectile') {
                          return { range: 42, angle: 44, velocity: 20 };
                        }
                        if (task.experimentType === 'collision') {
                          return { momentumBefore: 10, momentumAfter: 9.995, energyBefore: 50, energyAfter: 49.25, restitution: 1.0, momentumError: 0.005, energyError: 0.015 };
                        }
                        return {};
                      })();

                      const result = task.validation(measurementToUse);
                      if (result.success) {
                        handleTaskComplete(task.id);
                        alert('✓ ' + result.message);
                      } else {
                        alert('✗ ' + result.message);
                      }
                    }} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium" title="Проверить результаты">
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {isCompleted && (
                  <div className="mt-3 text-sm text-green-700 font-medium flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Задание выполнено!</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-12 max-w-2xl mx-auto bg-amber-50 border-l-4 border-amber-600 p-6 rounded-lg">
          <h3 className="font-semibold text-slate-800 mb-2 flex items-center space-x-2">
            <Info className="w-5 h-5 text-amber-600" />
            <span>Как выполнять задания</span>
          </h3>
          <ol className="text-slate-700 space-y-2 text-sm list-decimal list-inside">
            <li>Откройте задание в лаборатории, нажав на соответствующую кнопку</li>
            <li>Настройте параметры эксперимента согласно условиям задания</li>
            <li>Запустите симуляцию и проведите измерения</li>
            <li>Лаборатория автоматически сохранит последние измерения; затем нажмите «Проверить результаты»</li>
            <li>Если автоматических измерений нет — вам будет предложено проверить на тестовых данных</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
