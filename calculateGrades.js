

module.exports = {
  calculateLetterGrades: function(m, e, s, h, a) {
          let clg = 0;

      const average = (m + e + s + h + a) / 5;

      if (average >= 90) {
          clg = "A";
      } else if (average >= 80) {
          clg = "B";
      } else if (average >= 70) {
          clg = "C";
      } else if (average >= 60) {
          clg = "D";
      }
      else{
        clg = "F";
      }

      return clg;
  },


  calculateGPA: function(m, e, s, h, a) {
    const gpa = ((m + e + s + h + a) / 500) * 4;

    
    return gpa;
  }
};
