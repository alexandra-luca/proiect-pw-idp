db.createUser({
    user: 'warbnb',
    pwd: '!@#4QWEr',
    roles: [{
        role: 'readWrite',
        db: 'warbnb'
    }]
})
