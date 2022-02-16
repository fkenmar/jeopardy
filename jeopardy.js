// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];
const NUM_CATEGORIES = 6;
const baseHTTP = 'https://jservice.io/api/'
const NUM_CLUES = 6;
const NUM_QUESTIONS_PER_CAT = 5;

/** Get NUM_CATEGORIES random category from API.
 *  
 * Returns array of category ids
 */

async function getCategoryIds() {
    let res = await axios.get(`${baseHTTP}categories`, {params:{count:100}})
    return _.sampleSize(res.data.map(x => x.id),NUM_CATEGORIES) 
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
    let res = await axios.get(`${baseHTTP}category`, {params:{id:catId}})
    return {title: res.data.title, clues: _.sampleSize(res.data.clues, NUM_CLUES).map(function(x){
        return {question: x.question, answer: x.answer, showing: null};
    })}
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
    // Fills in the tablehead row with each category
    $('#categories').empty();
    for (let i = 0; i < NUM_CATEGORIES; i++){
        $('#categories').append($('<th>').text(categories[i].title).attr('id',`cat${i}`))
    }
    // Fills in tablebody with each question
    $('#tablebody').empty();
    for (let i = 0; i < NUM_QUESTIONS_PER_CAT; i++){
        $('#tablebody').append($('<tr>').attr('id',`Qrow${i}`))
        
    }
    let qrow = 0;
    while (qrow !== NUM_QUESTIONS_PER_CAT) {
        for (let x = 0; x < NUM_CLUES ; x++){
            $(`#Qrow${qrow}`).append($('<td>').text('?').attr('id',`Q${qrow}C${x}`))
        }
        qrow++
    }

}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
    let targetCategoryidx = evt.target.id[3]
    let targetQuestionidx = evt.target.id[1]
    if (!evt.target.showing) {
        evt.target.showing = 'question'
        evt.target.innerHTML = categories[targetCategoryidx].clues[targetQuestionidx].question
    } else if (evt.target.showing === 'question') {
        evt.target.showing = 'answer'
        evt.target.innerHTML = categories[targetCategoryidx].clues[targetQuestionidx].answer
    } else {
        return false
    }
    
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
    // categories.empty();
    
    $('#center').append($('<div>').attr('class','spinner-grow text-secondary').attr('id','load'))
}
/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
    $('#load').remove()
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
    $('button').remove()
    categories.length = 0;
    for (catid of await getCategoryIds()){
        categories.push(await getCategory(catid))
    }
    showLoadingView()
    setTimeout(hideLoadingView,1000)
    setTimeout(fillTable,1250)
    setTimeout(function(){
      $('body').append($('<button>').text('RESET').attr('class','btn btn-danger rounded-circle').on('mousedown',function(){
          setupAndStart()

      })  )
    },1250)
    
    
}

/** On click of start / restart button, set up game. */
    $('button').on('mousedown',setupAndStart)
// TODO

/** On page load, add event handler for clicking clues */
    $('button').on('mousedown',function(){
        $('table').on('click',handleClick)
    })
// TODO



