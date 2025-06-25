import { BlogPost } from "@/types";

export const blogData: BlogPost[] = [
  {
    id: "1",
    title: "Understanding Calorie Deficit for Healthy Weight Loss",
    excerpt: "Learn how to create a sustainable calorie deficit that leads to healthy weight loss without compromising nutrition or metabolism. Discover practical strategies for Indian diets.",
    imageUrl: "https://images.unsplash.com/photo-1599058917765-a780eda07a3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1469&q=80",
    imageHint: "healthy balanced Indian meal",
    readMoreLink: "/blog/1",
    author: {
      name: "Dr. Anita Sharma",
      role: "Nutritionist",
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    },
    publishDate: "2023-07-15",
    category: "Nutrition",
    content: `
      <p>Creating a calorie deficit is essential for weight loss, but it's important to approach it in a healthy and sustainable way. A calorie deficit means consuming fewer calories than your body burns, which forces it to use stored fat for energy.</p>
      
      <h2>What is a Healthy Calorie Deficit?</h2>
      <p>A healthy calorie deficit typically involves reducing your daily caloric intake by 500-750 calories. This gradual approach leads to sustainable weight loss of about 0.5-1 kg per week. Larger deficits might lead to quicker weight loss initially but are often unsustainable and can negatively impact your metabolism and nutrition.</p>
      
      <h2>Calculating Your Calorie Needs</h2>
      <p>To create an effective deficit, you first need to know your Total Daily Energy Expenditure (TDEE). This is the total number of calories your body needs to maintain its current weight based on your activity level, age, gender, height, and weight.</p>
      
      <p>For most Indian adults with moderate activity levels:</p>
      <ul>
        <li>Women typically need between 1800-2200 calories for maintenance</li>
        <li>Men typically need between 2200-2800 calories for maintenance</li>
      </ul>
      
      <p>Once you know your TDEE, subtract 500-750 calories to create your deficit. However, women should not consume fewer than 1200 calories and men not fewer than 1500 calories daily, as this can lead to nutritional deficiencies.</p>
      
      <h2>Indian Diet Considerations</h2>
      <p>Traditional Indian diets can be adapted for a calorie deficit while maintaining cultural preferences:</p>
      <ul>
        <li>Choose smaller portions of rice and roti while maintaining vegetable intake</li>
        <li>Use less oil in cooking (try steaming, baking, or air frying)</li>
        <li>Incorporate more protein through dal, paneer, and legumes</li>
        <li>Choose whole grains like brown rice, millet, and whole wheat over refined versions</li>
        <li>Include yogurt (dahi) as a protein-rich, satisfying snack</li>
      </ul>
      
      <h2>Beyond Calorie Counting</h2>
      <p>While calorie counting is effective, also focus on:</p>
      <ul>
        <li>Protein intake (aim for 1.2-1.6g per kg of body weight)</li>
        <li>Fiber from vegetables, fruits, and whole grains</li>
        <li>Hydration (minimum 3 liters of water daily)</li>
        <li>Regular physical activity (both cardio and strength training)</li>
        <li>Adequate sleep (7-8 hours) for hormonal balance</li>
      </ul>
      
      <p>Remember that sustainable weight loss is a marathon, not a sprint. Focus on building healthy habits that you can maintain for life rather than seeking quick results through extreme measures.</p>
    `,
  },
  {
    id: "2",
    title: "Regional Indian Superfoods for Optimal Nutrition",
    excerpt: "Discover nutritional powerhouses from different regions of India that can enhance your diet. Learn how to incorporate these traditional foods into modern, balanced meal plans.",
    imageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    imageHint: "Indian spices and superfoods",
    readMoreLink: "/blog/2",
    author: {
      name: "Vikram Mehta",
      role: "Clinical Dietitian",
      imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    },
    publishDate: "2023-08-10",
    category: "Nutrition",
    content: `
      <p>India's diverse geography and cultural traditions have given rise to a variety of regional superfoods—nutrient-dense ingredients that offer exceptional health benefits. These traditional foods have been part of our ancestral diets for centuries and are now being recognized globally for their nutritional value.</p>
      
      <h2>North Indian Superfoods</h2>
      <ul>
        <li><strong>Amaranth (Rajgira/Ramdana):</strong> High in protein, calcium, and iron, this ancient grain is gluten-free and contains all essential amino acids.</li>
        <li><strong>Mustard Greens (Sarson):</strong> Packed with vitamins A, K, and C, these greens support bone health and immune function.</li>
        <li><strong>Black Chickpeas (Kala Chana):</strong> Higher in fiber than regular chickpeas, they help manage blood sugar and support digestive health.</li>
      </ul>
      
      <h2>South Indian Superfoods</h2>
      <ul>
        <li><strong>Finger Millet (Ragi):</strong> Extremely rich in calcium and contains essential amino acids. It has a low glycemic index, making it ideal for diabetics.</li>
        <li><strong>Jackfruit (Kathal):</strong> The unripe fruit is a versatile meat substitute high in fiber and potassium, while the ripe fruit offers antioxidants and vitamins.</li>
        <li><strong>Curry Leaves:</strong> These aromatic leaves contain antioxidants, iron, and vitamins that support hair health, digestion, and blood sugar regulation.</li>
      </ul>
      
      <h2>East Indian Superfoods</h2>
      <ul>
        <li><strong>Black Rice:</strong> Rich in anthocyanins (antioxidants), it helps fight inflammation and supports heart health.</li>
        <li><strong>Pumpkin Leaves (Kumro Shaak):</strong> Highly nutritious with vitamin A, C, and calcium, these are commonly used in Bengali cuisine.</li>
        <li><strong>Bamboo Shoots:</strong> Low in calories and high in fiber, they contain bioactive compounds with antimicrobial properties.</li>
      </ul>
      
      <h2>West Indian Superfoods</h2>
      <ul>
        <li><strong>Moringa:</strong> Called the "miracle tree," its leaves contain more iron than spinach, more vitamin C than oranges, and more potassium than bananas.</li>
        <li><strong>Kokum:</strong> This sour fruit contains garcinol, which has antioxidant and anti-inflammatory properties. It's also used to prevent heat stroke.</li>
        <li><strong>Guar Beans:</strong> High in protein and soluble fiber, they help regulate blood sugar and cholesterol levels.</li>
      </ul>
      
      <h2>Central Indian Superfoods</h2>
      <ul>
        <li><strong>Kodo Millet:</strong> Rich in fiber and minerals, it helps regulate blood sugar and supports heart health.</li>
        <li><strong>Chironji Seeds:</strong> These nutrient-dense seeds are rich in protein, fiber, and minerals. They're often used in traditional medicine.</li>
      </ul>
      
      <h2>Incorporating These Superfoods</h2>
      <p>Here are practical ways to add these superfoods to your daily diet:</p>
      <ul>
        <li>Replace rice with millets like ragi or amaranth 2-3 times a week</li>
        <li>Add moringa powder to smoothies, soups, or dals</li>
        <li>Use curry leaves in tempering for almost any dish</li>
        <li>Make kala chana chaat as a high-protein snack</li>
        <li>Try black rice kheer or pulao for special occasions</li>
        <li>Use kokum in curries or as a refreshing summer drink</li>
      </ul>
      
      <p>Remember, these traditional superfoods are not only nutritionally superior but also environmentally sustainable and adapted to local growing conditions. By incorporating them into your diet, you're supporting both your health and traditional agricultural practices.</p>
    `,
  },
  {
    id: "3",
    title: "Balancing Macronutrients for Indian Vegetarian Diets",
    excerpt: "Learn how to optimize protein, carbs, and fats in a vegetarian Indian diet. Discover plant-based protein sources and balanced meal planning strategies for optimal health and fitness.",
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    imageHint: "vegetarian Indian meal with protein sources",
    readMoreLink: "/blog/3",
    author: {
      name: "Priya Singh",
      role: "Sports Nutritionist",
      imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    },
    publishDate: "2023-09-05",
    category: "Nutrition",
    content: `
      <p>Vegetarian diets are deeply rooted in Indian culture, with over 30% of Indians following some form of vegetarianism. While these diets offer numerous health benefits, achieving optimal macronutrient balance—especially adequate protein—requires thoughtful planning.</p>
      
      <h2>Understanding Macronutrients</h2>
      <p>Macronutrients are the nutrients your body needs in large amounts: proteins, carbohydrates, and fats. Each plays essential roles:</p>
      <ul>
        <li><strong>Proteins:</strong> Build and repair tissues, create enzymes and hormones, support immune function</li>
        <li><strong>Carbohydrates:</strong> Provide energy, fuel brain function, support gut health through fiber</li>
        <li><strong>Fats:</strong> Support hormone production, vitamin absorption, brain health, and provide energy</li>
      </ul>
      
      <h2>Protein Optimization in Vegetarian Indian Diets</h2>
      <p>The biggest challenge for vegetarians is meeting protein requirements. Adult Indians need approximately 0.8-1g of protein per kg of body weight daily (more for athletes or those trying to build muscle).</p>
      
      <p><strong>Best vegetarian protein sources in Indian cuisine:</strong></p>
      <ul>
        <li><strong>Legumes:</strong> All dals (moong, masoor, toor), rajma, chole (100g cooked = 7-9g protein)</li>
        <li><strong>Dairy:</strong> Paneer (100g = 18g protein), Greek yogurt (100g = 10g protein), milk (100ml = 3.4g protein)</li>
        <li><strong>Soy products:</strong> Tofu (100g = 8-15g protein), soy chunks (100g = 52g protein)</li>
        <li><strong>Nuts and seeds:</strong> Peanuts, almonds, chia seeds, flax seeds (30g = 5-8g protein)</li>
        <li><strong>Whole grains:</strong> Quinoa, amaranth, oats (100g cooked = 3-5g protein)</li>
      </ul>
      
      <h2>Balancing Carbohydrates</h2>
      <p>Traditional Indian diets are often high in carbohydrates. Focus on quality and portion control:</p>
      <ul>
        <li>Choose whole grains (brown rice, whole wheat roti, millet) over refined options</li>
        <li>Aim for 40-50% of your calories from carbs (higher for very active individuals)</li>
        <li>Include plenty of fiber-rich vegetables with each meal</li>
        <li>Control portions of starchy foods like rice and roti</li>
      </ul>
      
      <h2>Healthy Fats in Indian Cooking</h2>
      <p>Traditional Indian cooking uses various oils and fats. Optimize your choices:</p>
      <ul>
        <li>Use cold-pressed oils like mustard, groundnut, or coconut oil</li>
        <li>Include ghee in moderation (rich in butyric acid, good for gut health)</li>
        <li>Add nuts, seeds, and avocados for essential fatty acids</li>
        <li>Aim for 25-30% of your calories from healthy fats</li>
      </ul>
      
      <h2>Sample Balanced Vegetarian Indian Meal Plan</h2>
      <p><strong>Breakfast:</strong></p>
      <ul>
        <li>Moong dal cheela (2) with paneer stuffing</li>
        <li>Greek yogurt (1/2 cup)</li>
        <li>Mixed fruit (1/2 cup)</li>
      </ul>
      
      <p><strong>Lunch:</strong></p>
      <ul>
        <li>Roti (2 small) or brown rice (1/2 cup)</li>
        <li>Rajma curry (1/2 cup)</li>
        <li>Palak paneer (1/2 cup)</li>
        <li>Cucumber raita (1/2 cup)</li>
      </ul>
      
      <p><strong>Snack:</strong></p>
      <ul>
        <li>Roasted chana (1/4 cup)</li>
        <li>Mixed nuts (10-12)</li>
        <li>Green tea</li>
      </ul>
      
      <p><strong>Dinner:</strong></p>
      <ul>
        <li>Multigrain roti (1-2)</li>
        <li>Mixed vegetable curry (1/2 cup)</li>
        <li>Tofu bhurji (1/2 cup)</li>
        <li>Mixed salad with lemon dressing</li>
      </ul>
      
      <p>This meal plan provides approximately 1700-1800 calories with 75-80g protein, balanced carbs, and healthy fats—suitable for an average adult. Adjust portions based on your individual needs and activity level.</p>
      
      <h2>Supplementation Considerations</h2>
      <p>Even with careful planning, vegetarians should consider monitoring these nutrients:</p>
      <ul>
        <li><strong>Vitamin B12:</strong> Consider supplementation as it's primarily found in animal products</li>
        <li><strong>Iron:</strong> Pair iron-rich foods with vitamin C to enhance absorption</li>
        <li><strong>Vitamin D:</strong> Get regular sun exposure or consider supplements</li>
        <li><strong>Omega-3 fatty acids:</strong> Include flax seeds, chia seeds, and walnuts regularly</li>
      </ul>
      
      <p>With thoughtful planning, vegetarian Indian diets can provide optimal nutrition for all fitness goals. Focus on including diverse protein sources throughout the day, choosing quality carbohydrates, and incorporating healthy fats.</p>
    `,
  },
  {
    id: "4",
    title: "Effective Exercise Strategies for Weight Management",
    excerpt: "Discover the most effective workout approaches for weight loss and maintenance. Learn how to combine cardio, strength training, and recovery for optimal results.",
    imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    imageHint: "person exercising with weights",
    readMoreLink: "/blog/4",
    author: {
      name: "Rahul Verma",
      role: "Fitness Coach",
      imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    },
    publishDate: "2023-10-22",
    category: "Fitness",
    content: `
      <p>While nutrition plays the primary role in weight management, exercise is crucial for maintaining weight loss, building metabolically active muscle tissue, and improving overall health. The right exercise strategy can significantly enhance your weight management efforts.</p>
      
      <h2>The Science of Exercise for Weight Management</h2>
      <p>Exercise contributes to weight management through several mechanisms:</p>
      <ul>
        <li>Burning calories during the activity itself</li>
        <li>Creating an "afterburn" effect (EPOC - Excess Post-exercise Oxygen Consumption)</li>
        <li>Building muscle, which increases resting metabolic rate</li>
        <li>Improving insulin sensitivity, enhancing how your body processes carbohydrates</li>
        <li>Reducing stress hormones that can contribute to weight gain</li>
        <li>Regulating appetite hormones</li>
      </ul>
      
      <h2>Cardio Exercise Strategies</h2>
      <p>Cardiovascular exercise is valuable for burning calories and improving heart health. For weight management, consider these approaches:</p>
      
      <h3>High-Intensity Interval Training (HIIT)</h3>
      <p>HIIT involves short bursts of intense activity alternated with recovery periods:</p>
      <ul>
        <li>Burns more calories in less time than steady-state cardio</li>
        <li>Creates a significant afterburn effect</li>
        <li>Improves cardiovascular health and insulin sensitivity</li>
        <li>Sample routine: 30 seconds of sprinting followed by 90 seconds of walking, repeated 8-10 times</li>
        <li>Ideal frequency: 2-3 times per week (not daily, as recovery is essential)</li>
      </ul>
      
      <h3>Moderate-Intensity Steady-State Cardio (MISS)</h3>
      <p>Longer duration, moderate-intensity activities:</p>
      <ul>
        <li>Improves endurance and cardiovascular health</li>
        <li>Burns calories during the activity</li>
        <li>Lower impact and easier to recover from than HIIT</li>
        <li>Examples: Brisk walking, cycling, swimming at a consistent pace</li>
        <li>Ideal duration: 30-60 minutes</li>
        <li>Frequency: 3-5 times per week</li>
      </ul>
      
      <h2>Strength Training for Weight Management</h2>
      <p>Strength training is often undervalued in weight management but offers unique benefits:</p>
      <ul>
        <li>Builds metabolically active muscle tissue</li>
        <li>Increases resting metabolic rate</li>
        <li>Improves body composition (the ratio of fat to muscle)</li>
        <li>Enhances functional fitness and prevents age-related muscle loss</li>
        <li>Creates an afterburn effect</li>
      </ul>
      
      <h3>Effective Strength Training Approaches</h3>
      <ul>
        <li><strong>Circuit Training:</strong> Performing a series of exercises with minimal rest between them, targeting different muscle groups</li>
        <li><strong>Compound Movements:</strong> Exercises that work multiple muscle groups simultaneously (squats, deadlifts, push-ups, rows)</li>
        <li><strong>Progressive Overload:</strong> Gradually increasing weight, repetitions, or intensity over time</li>
        <li><strong>Frequency:</strong> 2-4 times per week, allowing 48 hours for muscle recovery between sessions targeting the same muscle groups</li>
      </ul>
      
      <h2>Building an Effective Weekly Exercise Plan</h2>
      <p>A balanced approach combining different exercise types yields the best results:</p>
      
      <p><strong>Sample 5-Day Plan:</strong></p>
      <ul>
        <li><strong>Monday:</strong> Full-body strength training (45 minutes)</li>
        <li><strong>Tuesday:</strong> HIIT cardio session (25 minutes)</li>
        <li><strong>Wednesday:</strong> Upper body strength training + light cardio (45 minutes)</li>
        <li><strong>Thursday:</strong> Active recovery - yoga or walking (30-45 minutes)</li>
        <li><strong>Friday:</strong> Lower body strength training (45 minutes)</li>
        <li><strong>Saturday:</strong> Longer moderate-intensity cardio (45-60 minutes)</li>
        <li><strong>Sunday:</strong> Complete rest or very light activity like walking</li>
      </ul>
      
      <h2>Exercise Considerations for Different Goals</h2>
      
      <h3>For Weight Loss:</h3>
      <ul>
        <li>Create a moderate calorie deficit through diet (primary) and exercise (secondary)</li>
        <li>Include both strength training and cardio</li>
        <li>Focus on consistency rather than intensity</li>
        <li>Start with 3-4 sessions per week and gradually increase</li>
      </ul>
      
      <h3>For Weight Maintenance:</h3>
      <ul>
        <li>Prioritize strength training to maintain muscle mass</li>
        <li>Include activities you enjoy to ensure long-term adherence</li>
        <li>Aim for 150-300 minutes of moderate activity weekly (per WHO guidelines)</li>
        <li>Monitor and adjust as needed to maintain weight</li>
      </ul>
      
      <h2>Overcoming Exercise Plateaus</h2>
      <p>When progress stalls, consider these strategies:</p>
      <ul>
        <li>Change your routine every 4-6 weeks</li>
        <li>Increase intensity gradually</li>
        <li>Try new activities that challenge your body in different ways</li>
        <li>Ensure adequate recovery through proper sleep and nutrition</li>
        <li>Consider working with a fitness professional to refine your approach</li>
      </ul>
      
      <h2>The Role of Non-Exercise Activity Thermogenesis (NEAT)</h2>
      <p>NEAT refers to calories burned through daily activities outside of formal exercise:</p>
      <ul>
        <li>Take stairs instead of elevators</li>
        <li>Walk or cycle for short trips</li>
        <li>Integrate movement breaks during work</li>
        <li>Engage in active hobbies</li>
      </ul>
      <p>NEAT can account for significant calorie expenditure and is often easier to sustain than formal exercise regimens.</p>
      
      <p>Remember that the best exercise plan is one you can consistently follow. Start where you are, progress gradually, and focus on building sustainable habits rather than pursuing extreme regimens that lead to burnout or injury.</p>
    `,
  }
]; 