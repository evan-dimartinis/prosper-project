<h1>Prosper Project</h1>

Project Setup and General Notes:
- This is a very basic node project. Just pull down the repo and run `npm install` to initialize. The main functionality described in the prompt can be found in src/app/main.ts
- I created a very basic test suite in src/app/main.test.ts which tests the basic requirements described in the prompt. They all should pass and can be run with a simple `npm test`
- You can also test with more data by running `node src/app/main.ts`, which will run a basic test scenario out of main.ts that pulls in the slots.json data for 2 different clinicians and logs the output. This was just a simple way to test a larger amount of data with minimal setup in a way that I could see some of the output (which I'm re-formatting slightly for readability)

Part 1:
- I returned a tuple of AvailableSlot objects in this function, rather than just the raw dates. I thought that would be more practical in an actual application so the user could see the clinician or other metadata associated with the opening.
- I assumed here that we only wanted appointments and their follow-ups to be scheduled with the same clinician. (based off the fact the tuples should be grouped by clinician)
- I left the results as just a plain list of tuples that are sorted by clinician, rather than actually "grouped" in a more tangible way. The way that we're processing them makes this easy by default. If we wanted to group them better, we could put the results in a Map that connects clinician ids to a list of slots.
- Relevant tests: 'returns slots from psychologusts', 'returns only 90-minute slots', 'filters by patient insurance', and 'filters by patient state'. 

Part 2:
- The key to this part to me was where to implement this logic. I ended up adding it on the clinician processing level, so before we match up initial and follow-up appointments for a clinician we run this logic to filter out overlapping/clusters of slots.
- This seemed like the right place to do it because I would assume from a product perspective we wouldn't want clinician A's slots to be filtered out just because clinician B had availability around the same time. So this way if clinician A and B both have a lot of availability between 8am and 11am, we still show the maximum amount of slots for each of them for that time period, without having one schedule affect the other.
- Relevant tests: 'filters out overlapping time slots'

Part 3:
- This part was pretty straightforward I thought.
- Initially I had this logic set up to loop through each available slot, and for each available slot it would calculate the number of appointments the clinician had for that day/week every time. Because it seems like there's a good chance there would be a lot of available slots on the same day or in the same week in this type of applicaiton, I decided to remove that brute-force logic and calculate all the day/week counts up front and store them in a map. This way we get the counts ahead of time and don't have to loop through all the appointments for each available slot that we're processsing/filtering.
- Relevant tests: 'Respects max daily appointments', 'Respects max weekly appointments'
