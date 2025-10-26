import { useState } from 'react';
import { ArrowLeft, CheckCircle2, XCircle, Info } from 'lucide-react';
import { Task } from '../types/physics';

interface TasksProps {
  onNavigate: (page: string) => void;
}

const tasks: Task[] = [
  {
    id: '1',
    title: 'Период маятника',
    description: 'Установите длину маятника 1.0 м и проверьте, что период колебаний составляет 2.0 ± 0.1 с',
    experimentType: 'pendulum',
    targetParams: { length: 1.0, period: 2.0, tolerance: 0.1 },
    validation: (measured) => {
      const expectedPeriod = 2.0;
      const tolerance = 0.1;
      const diff = Math.abs(measured.period - expectedPeriod);
      if (diff <= tolerance) {
        return { success: true, message: `Отлично! Период: ${measured.period.toFixed(2)} с` };
      }
      return { success: false, message: `Период ${measured.period.toFixed(2)} с не соответствует ожидаемому ${expectedPeriod} ± ${tolerance} с` };
    },
  },
  {
    id: '2',
    title: 'Дальность полёта',
    description: 'Настройте параметры так, чтобы дальность полёта снаряда составила 40 ± 5 метров',
    experimentType: 'projectile',
    targetParams: { range: 40, tolerance: 5 },
    validation: (measured) => {
      const expectedRange = 40;
      const tolerance = 5;
      const diff = Math.abs(measured.range - expectedRange);
      if (diff <= tolerance) {
        return { success: true, message: `Отлично! Дальность: ${measured.range.toFixed(1)} м` };
      }
      return { success: false, message: `Дальность ${measured.range.toFixed(1)} м не соответствует ожидаемой ${expectedRange} ± ${tolerance} м` };
    },
  },
  {
    id: '3',
    title: 'Сохранение импульса',
    description: 'Проверьте закон сохранения импульса при столкновении двух тел. Отклонение должно быть менее 1%',
    experimentType: 'collision',
    targetParams: { momentumError: 0.01 },
    validation: (measured) => {
      const tolerance = 0.01;
      if (measured.momentumError <= tolerance) {
        return { success: true, message: `Отлично! Отклонение: ${(measured.momentumError * 100).toFixed(2)}%` };
      }
      return { success: false, message: `Отклонение ${(measured.momentumError * 100).toFixed(2)}% превышает допустимые ${tolerance * 100}%` };
    },
  },
  {
    id: '4',
    title: 'Упругое столкновение',
    description: 'Настройте упругое столкновение (e=1.0) и проверьте сохранение кинетической энергии (отклонение < 2%)',
    experimentType: 'collision',
    targetParams: { energyError: 0.02, restitution: 1.0 },
    validation: (measured) => {
      const tolerance = 0.02;
      if (measured.energyError <= tolerance && measured.restitution >= 0.95) {
        return { success: true, message: `Отлично! Потеря энергии: ${(measured.energyError * 100).toFixed(2)}%` };
      }
      return { success: false, message: `Потеря энергии ${(measured.energyError * 100).toFixed(2)}% превышает допустимые ${tolerance * 100}%` };
    },
  },
  {
    id: '5',
    title: 'Оптимальный угол',
    description: 'Найдите угол, при котором дальность полёта будет максимальной при начальной скорости 20 м/с',
    experimentType: 'projectile',
    targetParams: { velocity: 20, optimalAngle: 45, tolerance: 5 },
    validation: (measured) => {
      const optimalAngle = 45;
      const tolerance = 5;
      const diff = Math.abs(measured.angle - optimalAngle);
      if (diff <= tolerance && measured.velocity === 20) {
        return { success: true, message: `Отлично! Угол ${measured.angle}° близок к оптимальному` };
      }
      return { success: false, message: `Попробуйте изменить угол. Оптимальный угол около ${optimalAngle}°` };
    },
  },
  {
    id: '6',
    title: 'Влияние массы на период',
    description: 'Проверьте, что период колебаний маятника не зависит от массы груза',
    experimentType: 'pendulum',
    targetParams: { length: 2.0 },
    validation: (measured) => {
      if (measured.mass1Period && measured.mass2Period) {
        const diff = Math.abs(measured.mass1Period - measured.mass2Period);
        const avgPeriod = (measured.mass1Period + measured.mass2Period) / 2;
        const relativeError = diff / avgPeriod;
        if (relativeError < 0.05) {
          return { success: true, message: `Верно! Периоды практически одинаковые: ${measured.mass1Period.toFixed(2)} с и ${measured.mass2Period.toFixed(2)} с` };
        }
      }
      return { success: false, message: 'Измерьте период для разных масс при одинаковой длине' };
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
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center space-x-2 text-slate-700 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Назад на главную</span>
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Практические задания</h1>
          <p className="text-slate-600">
            Выполните задания в лаборатории и проверьте свои результаты
          </p>
          <div className="mt-4 flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm text-slate-700">
                Выполнено: {completedTasks.size} / {tasks.length}
              </span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => {
            const isCompleted = completedTasks.has(task.id);
            const experimentNames: Record<string, string> = {
              pendulum: 'Маятник',
              projectile: 'Проекция',
              collision: 'Столкновение',
            };

            return (
              <div
                key={task.id}
                className={`bg-white rounded-xl shadow-lg p-6 border-2 transition-all ${
                  isCompleted
                    ? 'border-green-400 bg-green-50'
                    : 'border-transparent hover:shadow-xl'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="text-xs text-blue-600 font-medium mb-1">
                      {experimentNames[task.experimentType] || task.experimentType}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">{task.title}</h3>
                  </div>
                  {isCompleted && (
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 ml-2" />
                  )}
                </div>

                <p className="text-sm text-slate-600 mb-4">{task.description}</p>

                <div className="bg-blue-50 border-l-4 border-blue-600 p-3 rounded mb-4">
                  <div className="flex items-start space-x-2">
                    <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-slate-700">
                      <div className="font-semibold mb-1">Целевые параметры:</div>
                      <div className="space-y-1">
                        {Object.entries(task.targetParams).map(([key, value]) => (
                          <div key={key}>
                            {key}: {typeof value === 'number' ? value.toFixed(2) : value}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      onNavigate('laboratory');
                    }}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Открыть в лаборатории
                  </button>
                  {!isCompleted && (
                    <button
                      onClick={() => {
                        const mockMeasurement: Record<string, number> = {};
                        if (task.experimentType === 'pendulum') {
                          mockMeasurement.period = 2.05;
                          mockMeasurement.mass1Period = 2.83;
                          mockMeasurement.mass2Period = 2.81;
                        } else if (task.experimentType === 'projectile') {
                          mockMeasurement.range = 42;
                          mockMeasurement.angle = 44;
                          mockMeasurement.velocity = 20;
                        } else if (task.experimentType === 'collision') {
                          mockMeasurement.momentumError = 0.005;
                          mockMeasurement.energyError = 0.015;
                          mockMeasurement.restitution = 1.0;
                        }

                        const result = task.validation(mockMeasurement);
                        if (result.success) {
                          handleTaskComplete(task.id);
                          alert('✓ ' + result.message);
                        } else {
                          alert('✗ ' + result.message);
                        }
                      }}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      title="Проверить результаты"
                    >
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
            <li>Сравните полученные результаты с целевыми значениями</li>
            <li>При выполнении условий задания нажмите кнопку проверки</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
