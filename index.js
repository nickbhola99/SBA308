// The provided course information.
const CourseInfo = {
  id: 451,
  name: "Introduction to JavaScript",
};

// The provided assignment group.
const AssignmentGroup = {
  id: 12345,
  name: "Fundamentals of JavaScript",
  course_id: 451,
  group_weight: 25,
  assignments: [
    {
      //AssignmentInfo
      id: 1,
      name: "Declare a Variable",
      due_at: "2023-01-25",
      points_possible: 50,
    },
    {
      id: 2,
      name: "Write a Function",
      due_at: "2023-02-27",
      points_possible: 150,
    },
    {
      id: 3,
      name: "Code the World",
      due_at: "3156-11-15",
      points_possible: 500,
    },
  ],
};

// The provided learner submission data.
//elimante based on key and submission
const LearnerSubmissions = [
  {
    learner_id: 125,
    assignment_id: 1,
    submission: {
      submitted_at: "2023-01-25",
      score: 47,
    },
  },
  {
    learner_id: 125,
    assignment_id: 2,
    submission: {
      submitted_at: "2023-02-12",
      score: 150,
    },
  },
  {
    learner_id: 125,
    assignment_id: 3,
    submission: {
      submitted_at: "2023-01-25",
      score: 400,
    },
  },
  {
    learner_id: 132,
    assignment_id: 1,
    submission: {
      submitted_at: "2023-01-24",
      score: 39,
    },
  },
  {
    learner_id: 132,
    assignment_id: 2,
    submission: {
      submitted_at: "2023-03-07",
      score: 140,
    },
  },
];

function getMaxGrade(ag, bannedIDs) {
  //Function finds the maximum grade possible, which will be used in the future for calculating the weighted average
  //an array of banned assignment IDs is used to know which assignments to skip over in the calculation
  let max = 0;
  for (let i = 0; i < ag.assignments.length; i++) {
    if (bannedIDs.includes(ag.assignments[i].id)) {
      continue;
    } else {
      max += ag.assignments[i].points_possible;
    }
  }
  return max;
}

function getIDs(submissions) {
  //this simply returns an array containing every unique learner ID in LeanerSubmissions, this will make dealing with every unique individual easier
  let IDs = [];
  submissions.forEach((element) => {
    if (!IDs.includes(element.learner_id)) {
      IDs.push(element.learner_id);
    }
  });
  return IDs;
}

function banIDs(ag) {
  //this function creates an array of banned assignments
  //they're banned if their due date is far into the future, I decided to use the 1st day of 2024 as the cutoff
  const currentyear = "2024-01-01";
  let bannedIDs = [];
  for (var i = 0; i < ag.assignments.length; i++) {
    if (ag.assignments[i].due_at > currentyear) {
      bannedIDs.push(i + 1);
    }
  }
  return bannedIDs;
}

function getLearnerData(course, ag, submissions) {
  //try and catch statements to check for correct syntax
  try {
    if (course.id != ag.course_id) {
      throw "Error: Mismatched Course ID for Assignment Group";
    }
  } catch (err) {
    return console.log(err);
  }
  try {
    ag.assignments.forEach((points) => {
      if (points.points_possible == 0) {
        throw "Error: Points Possible can't be Zero";
      }
      if (typeof points.due_at != "string") {
        throw "Error: Due Date was written in wrong format";
      }
    });
  } catch (err) {
    return console.log(err);
  }
  try {
    submissions.forEach((element) => {
      if (typeof element.submission.submitted_at != "string") {
        throw "Error: Submission Date was written in wrong format";
      }
    });
  } catch (err) {
    return console.log(err);
  }
  let result = []; //final array where all the data wanted is processed
  let bannedAssignmentIds = banIDs(ag); //the assignments that will be skipped over in calculating average scores
  const maxGrade = getMaxGrade(ag, bannedAssignmentIds);
  let arrayofIDs = getIDs(submissions); //unique IQs
  arrayofIDs.sort(); //sorted just to keep things in order
  //forEach loops through every student ID to find their weighted average
  arrayofIDs.forEach((ID) => {
    let totalScore = 0;
    //nested loop to iterate through every submission, for every ID all of their grades are added into totalScore
    //skips over banned IDs
    //if an assignment is late, deduct 10 points from totalScore
    submissions.forEach((sub) => {
      if (ID == sub.learner_id) {
        if (bannedAssignmentIds.includes(sub.assignment_id)) {
          return;
        } else {
          totalScore += sub.submission.score;
          let obj = ag.assignments.find((e) => e.id == sub.assignment_id);
          if (sub.submission.submitted_at > obj.due_at) {
            totalScore -= 10;
          }
        }
      }
    });
    //finally, an object is pushed into result containing the ID and its weighted average
    result.push({
      id: ID,
      avg: totalScore / maxGrade,
    });
  });
  //this forEach iterated through result, and adds in new data for assignment grades for every object
  result.forEach((result2) => {
    submissions.forEach((sub2) => {
      //banned IDs are skipped over again
      if (result2["id"] == sub2.learner_id) {
        if (bannedAssignmentIds.includes(sub2.assignment_id)) {
          return;
        } else {
          let late = false; //boolean value for whether assignment was late or not
          let ob = ag.assignments.find((m) => m.id == sub2.assignment_id);
          if (sub2.submission.submitted_at > ob.due_at) {
            late = true;
            //the Assignment ID, info on lateness, and the grade are added to each object in result
            //10 points are deducted for late grades, the assignment asks for 10 but the example uses 15, I just decided to use 10
            result2[`Assignment: ${sub2.assignment_id}, Late: ${late},`] =
              (sub2.submission.score - 10) / ob.points_possible;
          } else {
            result2[`Assignment: ${sub2.assignment_id}, Late: ${late},`] =
              sub2.submission.score / ob.points_possible;
          }
        }
      }
    });
  });

  return result;


}

const result = getLearnerData(CourseInfo, AssignmentGroup, LearnerSubmissions);
console.log(result);

/* Final Results:
[
  {
    id: 125,
    avg: 0.985,
    'Assignment: 1, Late: false,': 0.94,
    'Assignment: 2, Late: false,': 1
  },
  {
    id: 132,
    avg: 0.845,
    'Assignment: 1, Late: false,': 0.78,
    'Assignment: 2, Late: true,': 0.8666666666666667
  }
]
*/
