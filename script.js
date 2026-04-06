document.addEventListener("DOMContentLoaded", function() {
    // Basic smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if(targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Simple typing effect for the subtitle
    const textArray = ["Native Mobile App Developer", "iOS (Objective-C/Swift) Expert", "Android (Java/Kotlin) Engineer", "Cross-Platform Flutter Dev"];
    let textIndex = 0;
    let charIndex = 0;
    const typedTextElement = document.querySelector('.typed-text');
    let isDeleting = false;

    function typeEffect() {
        const currentText = textArray[textIndex];
        
        if (isDeleting) {
            typedTextElement.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typedTextElement.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
        }

        let typeSpeed = isDeleting ? 50 : 100;

        if (!isDeleting && charIndex === currentText.length) {
            typeSpeed = 2000; // Pause at the end
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % textArray.length;
            typeSpeed = 500; // Pause before typing next word
        }

        setTimeout(typeEffect, typeSpeed);
    }

    // Start typing effect
    if(typedTextElement) {
        setTimeout(typeEffect, 1000);
    }
});
