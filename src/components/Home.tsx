import { FlaskConical, Video, ClipboardCheck, BookOpen } from 'lucide-react';

interface HomeProps {
  onNavigate: (page: string) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-slate-800 mb-4">
            Динамика.Lab
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Интерактивные симуляции по основам динамики: изучайте движение тел, силы, столкновения и колебания через практические эксперименты
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-16">
          <button
            onClick={() => onNavigate('laboratory')}
            className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            <div className="flex justify-center mb-4">
              <FlaskConical className="w-16 h-16 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Лаборатория</h3>
            <p className="text-slate-600">
              Интерактивные эксперименты с физическими симуляциями
            </p>
          </button>

          <button
            onClick={() => onNavigate('videos')}
            className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            <div className="flex justify-center mb-4">
              <Video className="w-16 h-16 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Видеоуроки</h3>
            <p className="text-slate-600">
              Образовательные видео по теоретическим основам
            </p>
          </button>

          <button
            onClick={() => onNavigate('tasks')}
            className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            <div className="flex justify-center mb-4">
              <ClipboardCheck className="w-16 h-16 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Задания</h3>
            <p className="text-slate-600">
              Практические задачи с автоматической проверкой
            </p>
          </button>

          <button
            onClick={() => onNavigate('about')}
            className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            <div className="flex justify-center mb-4">
              <BookOpen className="w-16 h-16 text-amber-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">О проекте</h3>
            <p className="text-slate-600">
              Справочные материалы, формулы и константы
            </p>
          </button>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Доступные эксперименты</h2>
          <div className="grid md:grid-cols-2 gap-4 text-slate-700">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold">Маятник</h4>
                <p className="text-sm text-slate-600">Гармонические колебания</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold">Горизонтальная проекция</h4>
                <p className="text-sm text-slate-600">Баллистическая траектория</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold">Свободное падение</h4>
                <p className="text-sm text-slate-600">С сопротивлением воздуха</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold">Столкновение тел</h4>
                <p className="text-sm text-slate-600">Упругий и неупругий удар</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold">Круговое движение</h4>
                <p className="text-sm text-slate-600">Центростремительная сила</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold">Вращение</h4>
                <p className="text-sm text-slate-600">Момент силы и инерция</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
