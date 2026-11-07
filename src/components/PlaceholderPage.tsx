import Icon from './ui/Icon'
import SectionBackground from './ui/SectionBackground'
import GlowLine from './ui/GlowLine'

interface PlaceholderPageProps {
  title: string
  description?: string
  icon?: string
}

export default function PlaceholderPage({
  title,
  description = 'This page is coming soon.',
  icon = 'fas fa-tools',
}: PlaceholderPageProps) {
  return (
    <SectionBackground minHeight="60vh" className="flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-lg">
        <div
          className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(162,133,57,0.2), rgba(43,25,120,0.4))',
            border: '1px solid rgba(162,133,57,0.35)',
          }}
        >
          <Icon name={`${icon} text-3xl`} style={{ color: '#c9a84c' }} />
        </div>
        <h1 className="text-3xl font-bold text-white">{title}</h1>
        <p className="text-gray-400">{description}</p>
        <GlowLine variant="bottom" className="w-24 mx-auto" />
      </div>
    </SectionBackground>
  )
}
