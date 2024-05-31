# Unpopular Yet Universal Beliefs Hub 🌍
Welcome to the Unpopular Yet Universal Beliefs Hub! This project is a fun and interactive web application that celebrates unpopular yet widely accepted opinions. Users can explore a curated list of opinions, react to them with emojis, and even add their own opinions to the hub. 🎉

## Quicksort Algorithm
The quicksort algorithm is a divide-and-conquer algorithm that recursively divides a list into smaller sublists based on a chosen pivot element and then sorts these sublists. In this case, the opinions are sorted based on a metric calculated for each opinion. The metric used is calculated as `likes + lit + skeleton - dislikes`. This metric is used to determine the "popularity" or ranking of each opinion.

### Why Quicksort
Quicksort is a widely used sorting algorithm known for its efficiency and average-case time complexity of O(n log n). It's particularly useful for large datasets or in situations where performance is crucial. The decision to use quicksort here is likely due to its speed and effectiveness in sorting the opinions based on their popularity metrics.

### How it Works
- The `quickSortOpinions` function takes an array of opinions as input.
- It recursively divides the array into smaller subarrays based on a pivot element (in this case, the last opinion in the array).
- It then compares each opinion's metric to the pivot metric and places them in either the left or right sublist accordingly.
- This process continues recursively until the entire array is sorted.