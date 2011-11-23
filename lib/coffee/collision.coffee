CollisionUtils =
    # The two intervals are [s1, f1] and [s2, f2]
    testIntervalCollision: (s1, f1, s2, f2) ->
        return true if s1 == s2
        return f1 >= s2 if s1 < s2
        return f2 >= s1
