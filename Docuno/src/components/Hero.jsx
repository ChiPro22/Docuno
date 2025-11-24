import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className="pt-20 flex items-center h-[100vh] border-b-2 border-black">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center h-full">

          {/* Left Content */}
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Talk to Your PDFs, 💬<br /> Get Instant Answers.
            </h1>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Upload documents and ask questions—Docuno's AI retrieves the right answers from your PDFs in seconds.
            </p>
            <div className="inline-block">
              <Link to="/chat">
                <button
                  className="cursor-pointer px-8 py-4 text-lg font-semibold text-white rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl w-fit"
                  style={{ backgroundColor: "var(--button-color)" }}
                >
                  Talk to Your PDF
                </button>
              </Link>
            </div>
          </div>

          {/* Right Image */}
          <div className="flex items-center justify-center">
            {/* Make sure you have this image in your public folder */}
            <img
              src="/landing-page-image.svg"
              alt="AI Document Analysis"
              className="drop-shadow-sm w-full max-w-[600px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;