Prosper Project

Notes

Part 1:
- I returned a tuple of AvailableSlot objects in this function, rather than just the raw dates. I thought that would be more practical in an actual application so the user could see the clinician that it was with.
- I assumed here that we only wanted appointments and their follow-ups to be scheduled with the same clinician. (based off the fact the tuples should be grouped by clinician) This affected the way that we did the matching with each clinician's available slots
- For grouping the results by clinician, I left the results as just a plain list of tuples that are sorted by clinician. The way that we're processing them makes this easy by default.
- The tests that are relevant to part 1 are 'returns slots from psychologusts', 'returns only 90-minute slots', 'filters by patient insurance', and 'filters by patient state'. 

Part 2:
- The key to this part to me was where to implement this logic. I ended up adding it on the clinician level so before we match up first and follow-up appointments we run this logic to filter out overlapping/clusters of slots.
- This seemed like the right place to do it because I would assume from a product perspective we wouldn't want clinician A's slots to be filtered out just because clinician B had availability around the same time. So this way if clinician A and B both have a lot of availability between 8am and 11am, we still show the maximum amount of slots for each of them for that time period, without having one schedule affect the other.

Part 3:
- This part was pretty straightforward I thought.
- Initially I had this logic set up to loop through each available slot, and for each available slot it would calculate the number of appointments the clinician had for that day/week every time. Because it seems like there's a good chance there would be a lot of available slots on the same day or in the same week in this type of applicaiton, I decided to remove that brute-force logic and calculate all the day/week counts up front and store them in a map. This way we get the counts ahead of time and don't have to loop through all the appointments for each available slot that we're processsing/filtering.
- 
