import FileUpload from '../components/FileUpload'
import ChatBox from '../components/ChatBox'

const Chat = () => {
  return (
    <div className='pt-20 h-screen w-full bg-[var(--secondary-color)] flex items-center justify-center overflow-hidden'>
      <div className="container mx-auto px-4 h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-6">
        {/* Left Panel - File Upload */}
        <div className='w-full md:w-1/3 lg:w-1/4 h-full'>
          <FileUpload />
        </div>
        
        {/* Right Panel - Chat */}
        <div className='w-full md:w-2/3 lg:w-3/4 h-full'>
          <ChatBox />
        </div>
      </div>
    </div>
  )
}

export default Chat;