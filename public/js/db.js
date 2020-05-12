//offline data
db.enablePersistence()
    .catch(err => {
        if (err.code == 'failed-precondition') {
            console.log('persistence failed')
        } else if (err.code == 'unimplemented') {
            console.log('persistence is not available')
        }
    })

//listener
db.collection('recipes').onSnapshot(snapshot => {
    console.log(snapshot.docChanges())

    snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
            renderRecipe(change.doc.data(), change.doc.id)
        }
        if (change.type === 'removed') {
            removeRecipe(change.doc.id)
        }
    })
})

//add new recipe
const form = document.querySelector('form')
form.addEventListener('submit', event => {
    event.preventDefault()
    const recipe = {
        title: form.title.value,
        ingridients: form.ingredients.value,
    }
    db.collection('recipes').add(recipe)
        .catch(err => console.log(err))

    form.title.value = ''
    form.ingredients.value = ''
})

//delete recipe
const recipeContainer = document.querySelector('.recipes')
recipeContainer.addEventListener('click', evt => {
    if(evt.target.tagName === 'I'){
        const id = evt.target.getAttribute('data-id')
        db.collection('recipes').doc(id).delete()
    }
})