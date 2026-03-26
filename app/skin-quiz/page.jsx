import SkinQuiz from "../components/SkinQuiz";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Page() {
  return (
    <div>
<Navbar />
    
    <div className="pt-32 pb-12 md:pt-40 md:pb-20">
      
      <SkinQuiz />
     
    </div>
     <Footer />
    </div>
  );
}
