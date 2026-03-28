import { getHomeFaqItems } from "@/src/server/repositories/homeFaqRepository";

type ArticleFaqProps = {
  /** Extra class on outer wrapper (e.g. home page spacing after calculator). */
  wrapperClassName?: string;
};

export async function ArticleFaq({ wrapperClassName }: ArticleFaqProps = {}) {
  const faqItems = await getHomeFaqItems();
  const wrapClass = ["light-content-wrapper", wrapperClassName].filter(Boolean).join(" ");
  return (
    <div className={wrapClass}>
      <div className="content-inner">
        <div className="article">
          <h2>BGMI सेंसिटिविटी कैलकुलेटर: प्रो सेटिंग्स का राज</h2>
          <p>
            BGMI में जीत हासिल करने के लिए सही सेंसिटिविटी का चुनाव आपके
            गेमप्ले का सबसे महत्वपूर्ण हिस्सा है। <b>SENS MASTER PRO</b> को इस
            तरह से बनाया गया है कि यह आपके फोन की <b>RAM</b>,{" "}
            <b>Processing Speed</b> और <b>Display Latency</b> के आधार पर कैमरा
            और ADS वैल्यू देता है।
          </p>
          <p>
            जब आप 90 FPS पर स्विच करते हैं, तो स्क्रीन तेज़ी से रिफ्रेश होती
            है, जिससे पुरानी सेंसिटिविटी तेज़ लग सकती है। यह टूल device और
            FPS के बीच सही balance रखता है।
          </p>

          <h2>Zero Recoil सेटिंग्स कैसे प्राप्त करें?</h2>
          <p>
            ज्यादातर प्लेयर्स दूसरों के sensitivity codes कॉपी कर लेते हैं।
            लेकिन iPhone 15 Pro की setting Poco X3 पर वैसी काम नहीं करती।
            Recoil control के लिए <b>ADS (Aim Down Sight)</b> sensitivity सबसे
            जरूरी होती है।
          </p>
        </div>

        <div className="faq-section">
          <h2>अक्सर पूछे जाने वाले प्रश्न (FAQ)</h2>
          {faqItems.length > 0 ? (
            <div className="faq-grid">
              {faqItems.map((item) => (
                <div key={item.id} className="faq-card">
                  <h4>{item.question}</h4>
                  <p>{item.answer}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
