import FileUpload from '../components/FileUpload'
import ChatBox from '../components/ChatBox'

const Chat = () => {
  return (
    // Changes: 
    // 1. Changed 'h-screen' to 'min-h-screen' (allows scrolling on mobile).
    // 2. Only use 'md:h-screen' and 'md:overflow-hidden' for desktop.
    <div className='pt-24 w-full bg-[var(--secondary-color)] flex items-center justify-center min-h-screen md:h-screen md:overflow-hidden'>
      
      <div className="container mx-auto px-4 flex flex-col md:flex-row gap-6 h-full pb-6 md:pb-0 md:h-[calc(100vh-7rem)]">
        
        {/* Left Panel - File Upload */}
        {/* Mobile: Fixed height (h-64) so it doesn't take full screen. Desktop: Full height */}
        <div className='w-full h-64 md:w-1/3 lg:w-1/4 md:h-full shrink-0'>
          <FileUpload />
        </div>
        
        {/* Right Panel - Chat */}
        {/* Mobile: Fixed height so you can scroll inside it. Desktop: Full height */}
        <div className='w-full h-[500px] md:w-2/3 lg:w-3/4 md:h-full'>
          <ChatBox />
        </div>
      </div>
    </div>
  )
}

export default Chat;