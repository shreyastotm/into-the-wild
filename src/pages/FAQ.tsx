import {
  MobileCard,
  MobilePage,
  MobileSection,
} from "@/components/mobile/MobilePage";

export default function FAQPage() {
  return (
    <MobilePage>
      <MobileSection
        title="Frequently Asked Questions"
        subtitle="Find answers to common questions about Into the Wild and our trekking adventures."
      >
        <div className="mobile-list">
          {[
            {
              question: "How do I book a trek?",
              answer:
                "You can book a trek by browsing our upcoming adventures on the home page or events page. Click on any trek that interests you, review the details, and click 'Register' to complete your booking. You'll need to create an account if you haven't already.",
            },
            {
              question: "What is the cancellation policy?",
              answer:
                "We offer flexible cancellation policies. You can cancel your booking up to 48 hours before the trek start time for a full refund. Cancellations within 48 hours may be subject to a 50% cancellation fee. Please check the specific trek details for exact terms.",
            },
            {
              question: "What should I bring for a trek?",
              answer:
                "Essential items include comfortable trekking shoes, weather-appropriate clothing, water bottle, snacks, sunscreen, and a small backpack. We'll provide a detailed packing list for each trek based on difficulty level and weather conditions.",
            },
            {
              question: "Are treks suitable for beginners?",
              answer:
                "Yes! We offer treks for all skill levels. Our treks are categorized as Beginner, Intermediate, and Advanced. Beginner treks are perfect for first-time trekkers with gentle terrain and shorter distances. Check the difficulty level before booking.",
            },
            {
              question: "What if the weather is bad?",
              answer:
                "Safety is our top priority. If weather conditions are unsafe, we may postpone or cancel the trek. In case of cancellation, you'll receive a full refund or the option to reschedule for a later date.",
            },
            {
              question: "Do you provide transportation?",
              answer:
                "Transportation varies by trek. Some treks include pickup from designated points, while others require you to reach the starting point independently. Check the trek details for specific transportation information.",
            },
            {
              question: "What is included in the trek cost?",
              answer:
                "The trek cost typically includes guide fees, basic safety equipment, and group activities. Food, transportation, and accommodation (for overnight treks) may or may not be included - check individual trek details for specifics.",
            },
            {
              question: "Can I join a trek alone?",
              answer:
                "Absolutely! Many of our participants join as individuals. Our treks are designed to be social experiences where you can meet like-minded adventurers. Group sizes are kept small to ensure everyone gets to know each other.",
            },
            {
              question: "What safety measures do you have?",
              answer:
                "All our treks are led by experienced and certified guides. We carry first aid kits, emergency communication devices, and follow established safety protocols. Guides are trained in wilderness first aid and emergency response.",
            },
            {
              question: "How do I prepare for my first trek?",
              answer:
                "Start with some light cardio exercises a few weeks before your trek. Break in your trekking shoes, stay hydrated, and get adequate rest. We'll send you a detailed preparation guide once you book your trek.",
            },
          ].map((faq, index) => (
            <MobileCard key={index}>
              <h3 className="mobile-heading-3 mb-3">{faq.question}</h3>
              <p className="mobile-body">{faq.answer}</p>
            </MobileCard>
          ))}
        </div>
      </MobileSection>
    </MobilePage>
  );
}
