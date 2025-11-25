import FileUpload from '../components/FileUpload'
import ChatBox from '../components/ChatBox'

const Chat = () => {
  return (
    <div className='pt-24 w-full bg-[var(--secondary-color)] min-h-screen flex flex-col items-center justify-start md:justify-center md:h-screen md:overflow-hidden'>
      
      <div className="container mx-auto px-4 flex flex-col md:flex-row gap-6 w-full pb-8 md:pb-0 md:h-[calc(100vh-7rem)]">
        
        {/* Left Panel - File Upload */}
        {/* Mobile: h-auto (grows to fit content). Desktop: h-full */}
        <div className='w-full h-auto md:w-1/3 lg:w-1/4 md:h-full shrink-0'>
          <FileUpload />
        </div>
        
        {/* Right Panel - Chat */}
        {/* Mobile: Fixed height to ensure scrolling works inside chat. Desktop: h-full */}
        <div className='w-full h-[500px] md:w-2/3 lg:w-3/4 md:h-full'>
          <ChatBox />
        </div>

      </div>
    </div>
  )
}

export default Chat;