#!/usr/bin/env python3
"""
AI Review Response Generator API
Optimized for Tipton County, TN businesses
"""

from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import openai
import os
import json
import time
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configuration
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', 'your-openai-api-key-here')
openai.api_key = OPENAI_API_KEY

class ReviewResponseGenerator:
    def __init__(self):
        self.business_types = {
            'restaurant': 'restaurant',
            'auto-repair': 'auto repair shop',
            'beauty-salon': 'beauty salon',
            'dental': 'dental practice',
            'real-estate': 'real estate agency',
            'retail': 'retail store',
            'healthcare': 'healthcare practice',
            'other': 'business'
        }
        
    def generate_response(self, business_name, business_type, review_text, rating):
        """Generate AI response to customer review"""
        
        # Determine tone and focus based on rating
        if rating >= 4:
            tone = "grateful and warm"
            focus = "thank them and encourage return visits"
        elif rating == 3:
            tone = "appreciative but professional"
            focus = "thank them and address any concerns diplomatically"
        else:
            tone = "professional and solution-focused"
            focus = "apologize sincerely and offer to make things right"
        
        business_display = self.business_types.get(business_type, 'business')
        
        prompt = f"""
        You are responding to a customer review for {business_name}, a {business_display} in Tipton County, Tennessee.
        
        Review: "{review_text}"
        Rating: {rating}/5 stars
        
        Write a {tone} response that:
        - {focus}
        - Keeps it under 100 words
        - Sounds personal, not generic
        - Uses the business name naturally
        - Reflects local Tennessee hospitality
        - Ends with an invitation to return or contact directly
        
        Response:
        """
        
        try:
            if OPENAI_API_KEY and OPENAI_API_KEY != 'your-openai-api-key-here':
                # Use OpenAI API if available
                response = openai.ChatCompletion.create(
                    model="gpt-4",
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=150,
                    temperature=0.7
                )
                return response.choices[0].message.content.strip()
            else:
                # Fallback to template-based responses
                return self.generate_template_response(business_name, business_type, review_text, rating)
                
        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            return self.generate_template_response(business_name, business_type, review_text, rating)
    
    def generate_template_response(self, business_name, business_type, review_text, rating):
        """Generate response using templates when AI API is unavailable"""
        
        templates = {
            5: [
                f"Thank you so much for the amazing 5-star review! We're thrilled you had such a wonderful experience at {business_name}. Your feedback means the world to us, and we can't wait to serve you again soon!",
                f"Wow, thank you for the fantastic review! We're so happy you chose {business_name} and that we exceeded your expectations. We look forward to welcoming you back!",
                f"Thank you for taking the time to leave such a wonderful review! We're delighted you had a great experience at {business_name}. See you again soon!"
            ],
            4: [
                f"Thank you for the great 4-star review! We're so pleased you enjoyed your experience at {business_name}. We appreciate your feedback and look forward to serving you again.",
                f"Thanks for the wonderful review! We're happy you had a positive experience at {business_name}. We're always working to improve and appreciate your support.",
                f"Thank you for choosing {business_name} and for the lovely review! We're glad you enjoyed your visit and hope to see you again soon."
            ],
            3: [
                f"Thank you for your honest feedback about {business_name}. We appreciate you taking the time to share your experience. We're always looking for ways to improve and would love to welcome you back.",
                f"Thanks for the review! We're glad you visited {business_name} and appreciate your feedback. We're constantly working to enhance our service and hope to exceed your expectations next time.",
                f"Thank you for your review of {business_name}. We value all feedback as it helps us grow and improve. We'd love the chance to provide you with an even better experience in the future."
            ],
            2: [
                f"Thank you for bringing this to our attention. We're sorry your experience at {business_name} didn't meet your expectations. We take all feedback seriously and would appreciate the opportunity to discuss this further. Please contact us directly so we can make this right.",
                f"We sincerely apologize that your visit to {business_name} wasn't up to our usual standards. Your feedback is important to us, and we'd like to make things right. Please reach out to us directly.",
                f"Thank you for your honest feedback. We're disappointed to hear about your experience at {business_name} and would like to address your concerns personally. Please contact us so we can improve."
            ],
            1: [
                f"We're truly sorry to hear about your disappointing experience at {business_name}. This is not the level of service we strive for, and we take your feedback very seriously. Please contact us directly so we can address your concerns and make this right.",
                f"We sincerely apologize for falling short of your expectations at {business_name}. Your experience is not reflective of our values, and we'd like to make it right. Please reach out to us directly to discuss this further.",
                f"Thank you for bringing this to our attention. We're genuinely sorry about your experience at {business_name} and want to make things right. Please contact us directly so we can address your concerns properly."
            ]
        }
        
        import random
        selected_templates = templates.get(rating, templates[3])
        response = random.choice(selected_templates)
        
        # Add contextual additions based on review content
        review_lower = review_text.lower()
        if 'food' in review_lower and rating >= 4:
            response += " We're so glad you enjoyed our cuisine!"
        elif 'service' in review_lower and rating >= 4:
            response += " Our team works hard to provide excellent service."
        elif rating <= 2:
            response += " We'd love the opportunity to make this right."
            
        return response

# Initialize generator
generator = ReviewResponseGenerator()

@app.route('/')
def home():
    """Serve the main website"""
    return render_template('index.html')

@app.route('/api/generate-response', methods=['POST'])
def generate_response():
    """API endpoint to generate review responses"""
    try:
        data = request.get_json()
        
        # Validate input
        required_fields = ['businessName', 'businessType', 'reviewText', 'rating']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        business_name = data['businessName'].strip()
        business_type = data['businessType']
        review_text = data['reviewText'].strip()
        rating = int(data['rating'])
        
        # Validate rating
        if rating < 1 or rating > 5:
            return jsonify({'error': 'Rating must be between 1 and 5'}), 400
        
        # Generate response
        response_text = generator.generate_response(
            business_name, business_type, review_text, rating
        )
        
        # Log the request (for analytics)
        logger.info(f"Generated response for {business_name} ({business_type}) - {rating} stars")
        
        return jsonify({
            'success': True,
            'response': response_text,
            'metadata': {
                'business_name': business_name,
                'business_type': business_type,
                'rating': rating,
                'generated_at': datetime.now().isoformat()
            }
        })
        
    except Exception as e:
        logger.error(f"Error generating response: {e}")
        return jsonify({'error': 'Failed to generate response'}), 500

@app.route('/api/business-types', methods=['GET'])
def get_business_types():
    """Get available business types"""
    return jsonify({
        'business_types': list(generator.business_types.keys()),
        'display_names': generator.business_types
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

@app.route('/api/demo', methods=['GET'])
def demo_data():
    """Get demo data for testing"""
    demo_examples = [
        {
            'businessName': "Joe's Restaurant",
            'businessType': 'restaurant',
            'reviewText': "Great food and excellent service! The staff was very friendly and the atmosphere was perfect for our date night. Will definitely be back!",
            'rating': 5
        },
        {
            'businessName': "Tipton Auto Repair",
            'businessType': 'auto-repair',
            'reviewText': "Fixed my car quickly and at a fair price. The mechanic explained everything clearly.",
            'rating': 4
        },
        {
            'businessName': "Covington Dental Care",
            'businessType': 'dental',
            'reviewText': "Clean office and professional staff. The dentist was gentle and thorough.",
            'rating': 5
        }
    ]
    
    return jsonify({'demo_examples': demo_examples})

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    
    print(f"🛡️ Azeroth Automation API starting on port {port}")
    print(f"🤖 AI Review Response Generator ready for Tipton County businesses!")
    
    app.run(host='0.0.0.0', port=port, debug=debug) 