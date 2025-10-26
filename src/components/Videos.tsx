import { ArrowLeft, ExternalLink } from 'lucide-react';

interface VideosProps {
  onNavigate: (page: string) => void;
}

interface VideoLesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  topic: string;
}

const videoLessons: VideoLesson[] = [
  {
    id: '1',
    title: 'Основы кинематики',
    description: 'Введение в понятия скорости, ускорения и траектории движения',
    duration: '12:34',
    topic: 'Кинематика',
  },
  {
    id: '2',
    title: 'Законы Ньютона',
    description: 'Три закона механики и их применение на практике',
    duration: '15:20',
    topic: 'Динамика',
  },
  {
    id: '3',
    title: 'Гармонические колебания',
    description: 'Математический и физический маятник, период колебаний',
    duration: '18:45',
    topic: 'Колебания',
  },
  {
    id: '4',
    title: 'Баллистическое движение',
    description: 'Движение тела под углом к горизонту',
    duration: '14:10',
    topic: 'Кинематика',
  },
  {
    id: '5',
    title: 'Закон сохранения импульса',
    description: 'Столкновения тел: упругие и неупругие удары',
    duration: '16:55',
    topic: 'Динамика',
  },
  {
    id: '6',
    title: 'Энергия и работа',
    description: 'Кинетическая и потенциальная энергия, закон сохранения энергии',
    duration: '13:28',
    topic: 'Энергия',
  },
  {
    id: '7',
    title: 'Круговое движение',
    description: 'Центростремительное ускорение и центробежная сила',
    duration: '11:40',
    topic: 'Вращение',
  },
  {
    id: '8',
    title: 'Момент силы',
    description: 'Вращательное движение и момент инерции',
    duration: '17:15',
    topic: 'Вращение',
  },
];

export default function Videos({ onNavigate }: VideosProps) {
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
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Видеоуроки</h1>
          <p className="text-slate-600">
            Образовательные видео по основам динамики и механики
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videoLessons.map((lesson) => (
            <div
              key={lesson.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="bg-gradient-to-br from-slate-700 to-slate-900 h-48 flex items-center justify-center relative">
                <div className="text-white text-center">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-1"></div>
                  </div>
                  <span className="text-sm font-medium">{lesson.duration}</span>
                </div>
                <div className="absolute top-3 right-3 bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
                  {lesson.topic}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  {lesson.title}
                </h3>
                <p className="text-slate-600 text-sm mb-4">
                  {lesson.description}
                </p>
                <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors">
                  <span>Смотреть урок</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg">
          <h3 className="font-semibold text-slate-800 mb-2">Совет по обучению</h3>
          <p className="text-slate-700">
            Для лучшего понимания материала рекомендуется сначала посмотреть видеоурок, затем
            провести соответствующий эксперимент в лаборатории и закрепить знания, выполнив
            практическое задание.
          </p>
        </div>
      </div>
    </div>
  );
}
