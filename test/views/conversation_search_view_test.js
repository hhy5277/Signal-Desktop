describe('ConversationSearchView', function() {
  it('should match partial numbers', function() {
    var $el = $('<div><div class="new-contact contact hide"></div></div>');
    var view = new Whisper.ConversationSearchView({
      el: $el,
      input: $('<input>'),
    }).render();
    var maybe_numbers = [
      '+1 415',
      '+1415',
      '+1415',
      '415',
      '(415)',
      ' (415',
      '(415) 123 4567',
      '+1 (415) 123 4567',
      ' +1 (415) 123 4567',
      '1 (415) 123 4567',
      '1 415-123-4567',
      '415-123-4567',
    ];
    maybe_numbers.forEach(function(n) {
      assert.ok(view.maybeNumber(n), n);
    });
  });
  describe('Searching for left groups', function() {
    let convo;

    before(() => {
      convo = new Whisper.ConversationCollection().add({
        id: 'a-left-group',
        name: 'i left this group',
        members: [],
        type: 'group',
        left: true,
      });

      return wrapDeferred(convo.save());
    });
    describe('with no messages', function() {
      var input;
      var view;

      before(function(done) {
        input = $('<input>');
        view = new Whisper.ConversationSearchView({ input: input }).render();
        view.$input.val('left');
        view.filterContacts();
        view.typeahead_view.collection.on('reset', function() {
          done();
        });
      });
      it('should not surface left groups with no messages', function() {
        assert.isUndefined(
          view.typeahead_view.collection.get(convo.id),
          'got left group'
        );
      });
    });
    describe('with messages', function() {
      var input;
      var view;
      before(function(done) {
        input = $('<input>');
        view = new Whisper.ConversationSearchView({ input: input }).render();
        convo.save({ lastMessage: 'asdf' }).then(function() {
          view.$input.val('left');
          view.filterContacts();
          view.typeahead_view.collection.on('reset', function() {
            done();
          });
        });
      });
      it('should surface left groups with messages', function() {
        assert.isDefined(
          view.typeahead_view.collection.get(convo.id),
          'got left group'
        );
      });
    });
  });
  describe('Showing all contacts', function() {
    let input;
    let view;
    let convo;

    before(() => {
      input = $('<input>');
      view = new Whisper.ConversationSearchView({ input: input }).render();
      view.showAllContacts = true;
      convo = new Whisper.ConversationCollection().add({
        id: 'a-left-group',
        name: 'i left this group',
        members: [],
        type: 'group',
        left: true,
      });

      return wrapDeferred(convo.save());
    });
    describe('with no messages', function() {
      before(function(done) {
        view.resetTypeahead();
        view.typeahead_view.collection.once('reset', function() {
          done();
        });
      });
      it('should not surface left groups with no messages', function() {
        assert.isUndefined(
          view.typeahead_view.collection.get(convo.id),
          'got left group'
        );
      });
    });
    describe('with messages', function() {
      before(done => {
        wrapDeferred(convo.save({ lastMessage: 'asdf' })).then(function() {
          view.resetTypeahead();
          view.typeahead_view.collection.once('reset', function() {
            done();
          });
        });
      });
      it('should surface left groups with messages', function() {
        assert.isDefined(
          view.typeahead_view.collection.get(convo.id),
          'got left group'
        );
      });
    });
  });
});
