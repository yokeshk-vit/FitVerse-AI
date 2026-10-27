
/*
 FitVerse AI - VIT Hostel Mess Menu
 Six categories, Monday to Sunday.
 Source: October 2026 mess menu screenshots.
 Verify menus against current hostel announcements.
*/

const DAYS = [
  "Monday", "Tuesday", "Wednesday", "Thursday",
  "Friday", "Saturday", "Sunday"
];


const parseMeal = (text) => {
  if (typeof text !== "string") {
    return [];
  }

  return text
    .split("|")
    .map(item => item.trim())
    .filter(Boolean);
};

const parseDay = (text) => {
  if (typeof text !== "string") {
    return null;
  }

  return text
    .split("~")
    .map(parseMeal);
};


const raw = {
  girls: {
    veg: [
      `Aloo Paratha|Curd|Vermicelli Upma|Coconut Chutney~
       Phulka|Urad Dhal|Lemon Rice|White Rice|Chow Chow Sambar|Rasam|Cabbage Poriyal|Cup Curd|Rice Papad~
       White Channa Sundal~
       Phulka|Rajma Masala|Curd Rice|White Rice|Sambar|Rasam|Butter Milk|Aloo Jeera Poriyal|Paneer Butter Masala|Water Melon`,

      `Vada Pav|Mint Chutney|Idly|Sambar|Chutney~
       Phulka|Dhal Tadka|Carrot Rice|Bittergourd Fry|White Rice|Keerai Sambar|Rasam|Cup Curd|Green Gram Sprouts|Fryums|Baby Corn Gravy|Gulab Jamun~
       Masala Vada~
       Mix Dhal|Methi Chapathi|Tomato Thokku|White Rice|Sambar|Rasam|Loose Curd|Cluster Beans Poriyal|Seasonal Fruit`,

      `Pongal|Sambar|Chutney|Vadai|Aloo Paratha|Curd|Pickle~
       Phulka|Dhal Makani|Rasam|Cup Curd|White Rice|Moore Kulambu|Tomato Rice|Raw Banana Fry|Rice Papad|Mushroom Peas Masala~
       Veg Puff~
       Phulka|Mix Dhal|White Rice|Sambar|Rasam|Loose Curd|Snake Gourd Poriyal|Papaya`,

      `Onion Uthappam|Sambar|Groundnut Chutney|Poha Namkeen~
       Chapathi|Dhal Makhani|Veg Pulao|White Rice|Mochai Kara Kulambu|Rasam|Cup Curd|Keerai Kuttu|Fryums~
       Sweet Corn Chat~
       Phulka|Dhal|Brinjal Fry|Garlic Sauce|White Rice|Sambar|Rasam|Loose Curd|Veg Chow Mein|Seasonal Fruit`,

      `Mixed Veg Paratha|Curd|Rava Kitchadi|Chutney~
       Phulka|Dhal|Tomato Rice|White Rice|Bottlegourd Sambar|Rasam|Cup Curd|Yam Fry|Rice Papad~
       Suzhiyam~
       Roti|Dhal|Urapadai|Chutney|White Rice|Sambar|Rasam|Butter Milk|Veg Tandoori Paneer Tikka|Banana`,

      `Dosa|Sambar|Vadai|Red Chilli Chutney~
       Chapathi|Masoor Dhal|White Rice|Pudina Rice|Vendakkai Kara Kulambu|Rasam|Cup Curd|Snake Gourd Sabji|Appalam~
       Donut~
       Roti|Dhal|Channa Masala|White Rice|Sambar|Rasam|Loose Curd|Aloo Podimas|Papaya`,

      `Methi Poori|Chickpea Masala|Brown Bread~
       Roti|Dhal Fry|White Rice|Brinjal Gravy|Rasam|Fryums|Onion Raitha|Vegetable Dum Biryani|Paneer 65|Ice Cream~
       Pani Puri (5 Nos)~
       Phulka|Dhal|Veg Jalfrezi|White Rice|Sambar|Rasam|Loose Curd|Peerkangai Poriyal|Banana`
    ],

    nonveg: [
      `Aloo Paratha|Curd|Vermicelli Upma|Coconut Chutney|Boiled Egg Masala~
       Phulka|Urad Dhal|Lemon Rice|White Rice|Chow Chow Sambar|Rasam|Cabbage Poriyal|Cup Curd|Rice Papad~
       White Channa Sundal~
       Phulka|Rajma Masala|Curd Rice|White Rice|Sambar|Rasam|Butter Milk|Aloo Jeera Poriyal|Water Melon|Butter Chicken Masala`,

      `Vada Pav|Mint Chutney|Idly|Sambar|Chutney|Scrambled Egg~
       Phulka|Dhal Tadka|Carrot Rice|Bittergourd Fry|White Rice|Keerai Sambar|Rasam|Cup Curd|Green Gram Sprouts|Fryums|Gulab Jamun|Chicken Gravy~
       Masala Vada~
       Methi Chapathi|Mix Dhal|Tomato Thokku|White Rice|Sambar|Rasam|Loose Curd|Cluster Beans Poriyal|Seasonal Fruit`,

      `Pongal|Sambar|Chutney|Vadai|Aloo Paratha|Curd|Pickle|French Toast~
       Phulka|Dhal Makani|Rasam|Cup Curd|White Rice|Moore Kulambu|Tomato Rice|Raw Banana Fry|Rice Papad|Malabar Fish Curry~
       Veg Puff~
       Phulka|Mix Dhal|White Rice|Sambar|Rasam|Loose Curd|Snake Gourd Poriyal|Papaya`,

      `Onion Uthappam|Sambar|Groundnut Chutney|Poha Namkeen|Masala Omelette~
       Chapathi|Dhal Makhani|Veg Pulao|White Rice|Mochai Kara Kulambu|Rasam|Cup Curd|Keerai Kuttu|Fryums~
       Sweet Corn Chat~
       Phulka|Dhal|Brinjal Fry|Garlic Sauce|White Rice|Sambar|Rasam|Loose Curd|Egg Chow Mein|Seasonal Fruit`,

      `Mixed Veg Paratha|Curd|Rava Kitchadi|Chutney|French Toast~
       Phulka|Dhal|Tomato Rice|White Rice|Bottlegourd Sambar|Rasam|Cup Curd|Yam Fry|Rice Papad~
       Suzhiyam~
       Roti|Dhal|Urapadai|Chutney|White Rice|Sambar|Rasam|Butter Milk|Tandoori Chicken|Banana`,

      `Dosa|Sambar|Vadai|Red Chilli Chutney|Boiled Egg Masala~
       Chapathi|Masoor Dhal|White Rice|Pudina Rice|Vendakkai Kara Kulambu|Rasam|Cup Curd|Snake Gourd Sabji|Appalam~
       Donut~
       Roti|Dhal|Channa Masala|White Rice|Sambar|Rasam|Loose Curd|Aloo Podimas|Papaya`,

      `Methi Poori|Chickpea Masala|Brown Bread|Boiled Egg~
       Roti|Dhal Fry|White Rice|Brinjal Gravy|Rasam|Fryums|Onion Raitha|Chicken Dum Biriyani|Ice Cream~
       Pani Puri (5 Nos)~
       Phulka|Dhal|Veg Jalfrezi|White Rice|Sambar|Rasam|Loose Curd|Peerkangai Poriyal|Banana`
    ],

    special: [
      `Aloo Paratha|Curd|Vermicelli Upma|Coconut Chutney|Vegetable Salad|Boiled Egg Masala|Musk Melon Juice~
       Phulka|Urad Dhal|Lemon Rice|White Rice|Chow Chow Sambar|Rasam|Cabbage Poriyal|Cup Curd|Rice Papad|Pineapple Pudding~
       White Channa Sundal~
       Phulka|Rajma Masala|Curd Rice|Aloo Jeera Poriyal|White Rice|Sambar|Rasam|Butter Milk|Paneer Butter Masala|Butter Chicken Masala|Sweet Corn Soup|Water Melon`,

      `Vada Pav|Mint Chutney|Idly|Sambar|Chutney|Mixed Sprouts Sundal|Scrambled Egg|Mint Lemon|Chocos~
       Phulka|Dhal Tadka|Carrot Rice|Bittergourd Fry|White Rice|Keerai Sambar|Rasam|Cup Curd|Green Gram Sprouts|Fryums|Baby Corn Gravy|Chicken Gravy|Gulab Jamun~
       Masala Vada~
       Methi Chapathi|Mix Dhal|Tomato Thokku|White Rice|Sambar|Rasam|Loose Curd|Cluster Beans Poriyal|Spring Onion Soup|Seasonal Fruit`,

      `Pongal|Sambar|Chutney|Vadai|Aloo Paratha|Curd|Pickle|Boiled Sweet Corn|French Toast|Mixed Fruit Juice~
       Phulka|Dhal Makani|Rasam|Cup Curd|White Rice|Moore Kulambu|Tomato Rice|Raw Banana Fry|Rice Papad|Mushroom Peas Masala|Malabar Fish Curry|Kova Mysorepaku~
       Veg Puff~
       Phulka|Mix Dhal|White Rice|Sambar|Rasam|Loose Curd|Snake Gourd Poriyal|Veg Chettinadu Soup|Papaya`,

      `Onion Uthappam|Sambar|Groundnut Chutney|Poha Namkeen|Sprouted Moong Dhal|Masala Omelette|Water Melon Juice|Chocos~
       Chapathi|Dhal Makhani|Veg Pulao|White Rice|Mochai Kara Kulambu|Rasam|Cup Curd|Keerai Kuttu|Fryums|Milk Peda~
       Sweet Corn Chat~
       Phulka|Dhal|Brinjal Fry|Garlic Sauce|White Rice|Sambar|Rasam|Loose Curd|Veg Chow Mein|Egg Chow Mein|Cream of Broccoli Soup|Seasonal Fruit`,

      `Mixed Veg Paratha|Curd|Rava Kitchadi|Chutney|Peanut Sundal|French Toast|Sapota Juice~
       Phulka|Dhal|Tomato Rice|White Rice|Bottlegourd Sambar|Rasam|Cup Curd|Yam Fry|Rice Papad|Bread Halwa~
       Suzhiyam~
       Roti|Dhal|Urapadai|Chutney|White Rice|Sambar|Rasam|Butter Milk|Tandoori Paneer Tikka|Tandoori Chicken|Palak Soup|Banana`,

      `Dosa|Sambar|Vadai|Red Chilli Chutney|Moochai Payaru Sundal|Boiled Egg Masala|Mixed Fruit Juice|Chocos~
       Chapathi|Masoor Dhal|Pudina Rice|White Rice|Vendakkai Kara Kulambu|Rasam|Cup Curd|Snake Gourd Sabji|Appalam|Shahi Tukra~
       Donut~
       Roti|Dhal|Channa Masala|White Rice|Sambar|Rasam|Loose Curd|Aloo Podimas|Veg Manchow Soup|Papaya`,

      `Methi Poori|Chickpea Masala|Brown Bread|Green Gram Sprouts|Boiled Egg|Apple Juice~
       Roti|Dhal Fry|White Rice|Brinjal Gravy|Rasam|Fryums|Onion Raitha|Paneer Biryani|Gobi 65|Chicken Dum Biriyani|Ice Cream~
       Pani Puri (5 Nos)~
       Phulka|Dhal|Veg Jalfrezi|White Rice|Sambar|Rasam|Loose Curd|Peerkangai Poriyal|Carrot Ginger Soup|Banana`
    ]
  },

  boys: {
    veg: [
      `Aloo Paratha|Curd|Vermicelli Upma|Coconut Chutney|Bread|Butter|Jam|Tea|Coffee|Milk~
       Phulka|Urad Dhal|White Rice|Sambar|Rasam|Cabbage Poriyal|Curd|Rice Papad|Paneer Butter Masala~
       White Channa Sundal|Tea|Coffee|Milk~
       Phulka|Dhal Rajma|Podi Dosa|Curd|Coriander Chutney|White Rice|Sambar|Rasam|Poriyal|Water Melon|Milk|Coffee`,

      `Poha Namkeen|Idly|Sambar|Chutney|Bread|Butter|Jam|Tea|Coffee|Milk~
       Phulka|Dhal Tadka|Bisibele Bath|Veg Jal Frezi|White Rice|Rasam|Curd|Green Gram Sprouts|Potato Chips|Gulab Jamun~
       Veg Cutlet (2 Nos)|Tea|Coffee|Milk~
       Mix Dhal|Methi Chapathi|Veg Fried Rice|White Rice|Sambar|Rasam|Loose Curd|Gobi Manchurian|Seasonal Fruit|Milk|Coffee`,

      `Pongal|Sambar|Chutney|Vada Pav|Bread|Butter|Jam|Tea|Coffee|Milk~
       Phulka|Dhal Makhani|Rasam|Curd|White Rice|Moore Kulambu|Paneer Butter Masala|Raw Banana Fry|Rice Papad~
       Brownie Cake|Tea|Coffee|Milk~
       Phulka|Mix Dhal|Veg Shai Kurma|Tomato Rice|White Rice|Sambar|Rasam|Loose Curd|Papaya|Milk|Coffee`,

      `Poha Namkeen|Onion Uthappam|Sambar|Peanut Chutney|Bread|Butter|Jam|Tea|Coffee|Milk~
       Phula|Dal|Aloo Capsicum Masala|White Rice|Sambar|Rasam|Curd|Carrot Poriyal~
       Paani Poori (5 Nos)|Tea|Coffee|Milk~
       Poori|Chenna Masala|White Rice|Sambar|Rasam|Chow Chow Kootu|Curd|Seasonal Fruit|Milk|Coffee`,

      `Gobi Paratha|Curd|Pickle|Kitchadi|Coconut Chutney|Bread|Butter|Jam|Tea|Coffee|Milk~
       Phulka|Dhal|Paneer Butter Masala|White Rice|Sambar|Rasam|Curd|Appalam|Jamoon~
       Masala Vada|Tea|Coffee|Milk~
       Chapathi|Yellow Dhal|Sambar|Idly|Peanut Chutney|White Rice|Rasam|Beet Root Poriyal|Loose Curd|Banana|Milk|Coffee`,

      `Podi Dosa|Sambar|Vadai|Red Chilli Chutney|Bread|Butter|Jam|Tea|Coffee|Milk~
       Phulka|Masoor Dhal|Green Peas Masala|Dahi Vada|White Rice|Rasam|Sambar|Appalam~
       Masala Peanuts|Tea|Coffee|Milk~
       Phulka|Aloo Capsicum Masala|White Rice|Sambar|Rasam|Loose Curd|Dhal Fry|Mint Pulav|Papaya|Milk|Coffee`,

      `Methi Poori|Chickpea Masala|Bread|Butter|Jam|Tea|Coffee|Milk~
       Phulka|Dhal Fry|White Rice|Brinjal Gravy|Rasam|Fryums|Onion Raitha|Vegetable Dum Biriyani|Paneer 65|Ice Cream~
       Sandwich|Tea|Coffee|Milk~
       Phulka|Dhal|Veg Jalfrezi|Kashmiri Pulav|White Rice|Sambar|Rasam|Loose Curd|Banana|Milk|Coffee`
    ],

    nonveg: [
      `Aloo Paratha|Curd|Vermicelli Upma|Coconut Chutney|Scrambled Egg|Bread|Butter|Jam|Tea|Coffee|Milk~
       Phulka|Urad Dhal|White Rice|Rasam|Sambar|Cabbage Poriyal|Curd|Papad|Egg Curry|Laddu~
       White Channa Sundal|Tea|Coffee|Milk~
       Phulka|Dhal Rajma|Podi Dosa|Curd|Coriander Chutney|White Rice|Sambar|Rasam|Poriyal|Banana|Milk|Coffee`,

      `Poha Namkeen|Idly|Sambar|Chutney|Non Veg Boiled Egg|Bread|Butter|Jam|Tea|Coffee|Milk~
       Phulka|Dhal Tadka|Bisibele Bath|Veg Jal Frezi|White Rice|Rasam|Curd|Salad|Potato Chips|Gulab Jamun~
       Veg Cutlet (2 Nos)|Tea|Coffee|Milk~
       Mix Dhal|Methi Chapathi|Egg Fried Rice|White Rice|Sambar|Rasam|Loose Curd|Gobi Manchurian|Seasonal Fruit|Milk|Coffee`,

      `Pongal|Sambar|Chutney|Vada Pav|Non Veg French Toast|Bread|Butter|Jam|Tea|Coffee|Milk~
       Phulka|Dhal Makhani|Rasam|Curd|White Rice|Moore Kulambu|Pepper Chicken|Rice Papad|Dry Jamoon~
       Brownie Cake|Tea|Coffee|Milk~
       Phulka|Mix Dhal|Veg Shai Kurma|Tomato Rice|White Rice|Sambar|Rasam|Loose Curd|Papaya|Milk|Coffee`,

      `Poha Namkeen|Onion Uthappam|Sambar|Peanut Chutney|Scrambled Egg|Bread|Butter|Jam|Tea|Coffee|Milk~
       Phulka|Dal|Aloo Capsicum Masala|White Rice|Sambar|Rasam|Curd|Carrot Poriyal~
       Paani Poori (5 Nos)|Tea|Coffee|Milk~
       Poori|Chenna Masala|White Rice|Sambar|Rasam|Chow Chow Kootu|Curd|Seasonal Fruit|Milk|Coffee`,

      `Mixed Veg Paratha|Curd|Rava Kitchadi|Chutney|Podimas|Bread|Butter|Jam|Tea|Coffee|Milk~
       Phulka|Rajma Dhal|White Rice|Sambar|Rasam|Curd|Chicken 65|Mix Veg Gravy|Poriyal|Rice Papad|Bread Halwa~
       Cake|Tea|Coffee|Milk~
       Phulka|Dhal|Idly|Peanut Chutney|Dum Aloo|White Rice|Sambar|Rasam|Butter Milk|Banana|Milk|Coffee`,

      `Podi Dosa|Sambar|Vadai|Red Chilli Chutney|Boiled Egg Masala|Bread|Butter|Jam|Tea|Coffee|Milk~
       Phulka|Masoor Dhal|Green Peas Masala|Dahi Vada|White Rice|Rasam|Sambar|Appalam~
       Masala Peanuts|Tea|Coffee|Milk~
       Phulka|Dhal|Aloo Capsicum Masala|Dhal Fry|White Rice|Sambar|Rasam|Loose Curd|Mint Pulav|Papaya|Milk|Coffee`,

      `Methi Poori|Chickpea Masala|Non Veg Boiled Egg|Bread|Butter|Jam|Tea|Coffee|Milk~
       Phulka|Dhal Fry|White Rice|Brinjal Gravy|Rasam|Fryums|Onion Raitha|Chicken Dum Biriyani|Ice Cream~
       Sandwich|Tea|Coffee|Milk~
       Phulka|Dhal|Veg Jalfrezi|Kashmiri Pulav|White Rice|Sambar|Rasam|Loose Curd|Water Melon|Milk|Coffee`
    ],

    special: [
      `Aloo Paratha|Curd|Vermicelli Upma|Coconut Chutney|Chocos|Vegetable Salad|Boiled Egg Masala|Musk Melon Juice|Bread|Butter|Jam|Tea|Coffee|Milk~
       Phulka|Urad Dhal|White Rice|Curd|Poriyal|Sambar|Rasam|Kadal Paneer|Makhan Peda|Kadai Chicken Masala|Rice Papad~
       White Channa Sundal|Tea|Coffee|Milk~
       Phulka|Dhal Rajma|Podi Dosa|Curd|Coriander Chutney|White Rice|Sambar|Rasam|Butter Milk|Sweet Corn Soup|Poriyal|Banana|Milk|Coffee`,

       `Kichidi|Podi Idly|Sambar|Chutney|Masala Omelette|Dates Milkshake|Sauthe Black Chenna Sundal|Chocos|Bread|Butter|Jam|Tea|Coffee|Milk~
       Pulka|Palak Green Gram Dal|Bisibela Bath|Potato Chips|White Rice|Rasam|Veg Kholapuri|Appalam|Badhusa|Poriyal~
       Mysore Bonda|Chutney|Tea|Coffee|Milk~
       Chapathi|Dhal|Veg & Egg Fried Rice|White Rice|Sambar|Rasam|Butter Milk|Baby Corn Manchurian|Poriyal|Hot and Sour Soup|Water Melon|Milk|Coffee`,

      `Pongal|Sambar|Chutney|Vada Pav|Boiled Sweet Corn|Corn Flakes|Bread|Butter|Jam|Tea|Coffee|Milk~
       Phulka|Dhal Makhani|Rasam|Curd|White Rice|Moore Kulambu|Paneer & Chicken Hyderabadi|Rice Papad|Poriyal|Kova Mysorepaku~
       Brownie Cake|Tea|Coffee|Milk~
       Phulka|Mix Dhal|White Rice|Sambar|Rasam|Loose Curd|Tomato Rice|Veg Shai Korma|Pumpkin Soup|Papaya|Milk|Coffee`,

      `Set Dosa|Vada Curry|Groundnut Chutney|Poha Namkeen|Chocos|Sprouted Moong Dhal|Scrambled Egg|Water Melon Juice|Bread|Butter|Jam|Tea|Coffee|Milk~
       Chapathi|Dhal Makhani|Malabar Fish Curry|Tangy Veg Curry|White Rice|Mochai Kara Kulambu|Rasam|Poriyal|Curd|Fryums|Rasmalai~
       Sweet Corn Chat|Tea|Coffee|Milk~
       Poori|Chenna Masala|Vangi Bath|White Rice|Sambar|Rasam|Loose Curd|Poriyal|Cream of Broccoli Soup|Seasonal Fruit|Milk|Coffee`,

      `Mixed Veg Paratha|Curd|Rava Kichadi|Chutney|Fresh Juice|Peanut Sundal|Podimas|Corn Flakes|Bread|Butter|Jam|Tea|Coffee|Milk~
       Phulka|Rajma Dhal|Tandoori Chicken|Poriyal|Paneer Amritsari|White Rice|Sambar|Rasam|Curd|Mix Veg Gravy|Rice Papad|Bread Halwa~
       Cake|Tea|Coffee|Milk~
       Phulka|Dhal|Rava Idly|Goshtu|White Rice|Sambar|Rasam|Dum Aloo|Butter Milk|Palak Soup|Banana|Milk|Coffee`,

      `Podi Dosa|Sambar|Chutney|Boiled Egg Masala|Sundal|Fresh Juice|Chocos|Bread|Butter|Jam|Tea|Coffee|Milk~
       Chapathi|Masoor Dhal|White Rice|Green Peas Masala|Sambar|Poriyal|Rasam|Dahi Vada|Appalam|Dry Jamun~
       Donut|Tea|Coffee|Milk~
       Phulka|Dhal|Aloo Capsicum Masala|White Rice|Sambar|Rasam|Loose Curd|Dhal Fry|Mint Pulav|Papaya|Milk|Coffee|Veg Manchow Soup|Egg Fried Rice`,

      `Methi Poori|Chickpea Masala|Boiled Egg|Corn Flakes|Green Gram Sprouts|Fresh Juice|Bread|Butter|Jam|Tea|Coffee|Milk~
       Phulka|Dhal Fry|White Rice|Brinjal Gravy|Rasam|Fryums|Onion Raitha|Chicken Dum Biriyani|Vegetable Dum Biriyani|Paneer 65|Ice Cream~
       Pani Puri (5 Nos)|Tea|Coffee|Milk~
       Phulka|Dhal|Veg Jalfrezi|White Rice|Sambar|Rasam|Loose Curd|Kashmiri Pulav|Peerkangai Poriyal|Carrot Ginger Soup|Water Melon|Milk|Coffee`
    ]
  }
};

// Convert compact food lists into the format
// expected by the existing MessMenu.jsx component.

const MEALS = ["breakfast", "lunch", "snacks", "dinner"];

function getMealTime(hostel, meal, dayIndex) {
  const weekend = dayIndex >= 5;

  if (meal === "breakfast") {
    return weekend
      ? "7:30 AM - 9:30 AM"
      : "7:00 AM - 9:00 AM";
  }

  if (meal === "lunch") {
    if (hostel === "girls") {
      return weekend
        ? "12:30 PM - 2:30 PM"
        : "12:00 PM - 2:00 PM";
    }

    return "12:30 PM - 2:30 PM";
  }

  if (meal === "snacks") {
    return hostel === "boys"
      ? "4:30 PM - 6:15 PM"
      : "4:30 PM - 6:00 PM";
  }

  return "7:00 PM - 9:00 PM";
}

function buildMenu(hostel, weeklyData) {
  const result = {};

  DAYS.forEach((day, dayIndex) => {
    const dayData = parseDay(weeklyData[dayIndex]);

    if (!dayData) {
      result[day] = null;
      return;
    }

    result[day] = {};

    MEALS.forEach((meal, mealIndex) => {
      result[day][meal] = {
        time: getMealTime(hostel, meal, dayIndex),
        items: dayData[mealIndex] || [],
        vegOptions: [],
        nonVegOptions: []
      };
    });
  });

  return result;
}

export const messDataV2 = {
  boys: {
    veg: buildMenu("boys", raw.boys.veg),
    nonveg: buildMenu("boys", raw.boys.nonveg),
    special: buildMenu("boys", raw.boys.special)
  },
  girls: {
    veg: buildMenu("girls", raw.girls.veg),
    nonveg: buildMenu("girls", raw.girls.nonveg),
    special: buildMenu("girls", raw.girls.special)
  }
};

