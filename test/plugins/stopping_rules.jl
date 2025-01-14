#  Copyright (c) 2017-22, Oscar Dowson and SDDP.jl contributors.
#  This Source Code Form is subject to the terms of the Mozilla Public License,
#  v. 2.0. If a copy of the MPL was not distributed with this file, You can
#  obtain one at http://mozilla.org/MPL/2.0/.

module TestStoppingRules

using Random
using SDDP
using Test
import GLPK

function runtests()
    for name in names(@__MODULE__; all = true)
        if startswith("$(name)", "test_")
            @testset "$(name)" begin
                getfield(@__MODULE__, name)()
            end
        end
    end
    return
end

function test_TimeLimit()
    graph = SDDP.PolicyGraph(
        SDDP.LinearGraph(2),
        lower_bound = 0.0,
        direct_mode = false,
    ) do node, stage
        @variable(node, x, SDDP.State, initial_value = 0)
    end
    rule = SDDP.TimeLimit(0.5)
    @test SDDP.stopping_rule_status(rule) == :time_limit
    @test SDDP.convergence_test(
        graph,
        [SDDP.Log(1, 0.0, 0.0, 1.0, 1, 1, " ")],
        rule,
    )
    @test !SDDP.convergence_test(
        graph,
        [SDDP.Log(1, 0.0, 0.0, 0.1, 1, 1, " ")],
        rule,
    )
    return
end

function test_IterationLimit()
    graph = SDDP.PolicyGraph(
        SDDP.LinearGraph(2),
        lower_bound = 0.0,
        direct_mode = false,
    ) do node, stage
        @variable(node, x, SDDP.State, initial_value = 0)
    end
    rule = SDDP.IterationLimit(2)
    @test SDDP.stopping_rule_status(rule) == :iteration_limit
    @test SDDP.convergence_test(
        graph,
        [
            SDDP.Log(1, 0.0, 0.0, 1.0, 1, 1, " "),
            SDDP.Log(2, 0.0, 0.0, 1.0, 1, 1, " "),
        ],
        rule,
    )
    @test !SDDP.convergence_test(
        graph,
        [SDDP.Log(1, 0.0, 0.0, 0.1, 1, 1, " ")],
        rule,
    )
    return
end

function test_Statistical()
    model = SDDP.PolicyGraph(
        SDDP.LinearGraph(2),
        bellman_function = SDDP.BellmanFunction(lower_bound = 0.0),
        optimizer = GLPK.Optimizer,
        sense = :Min,
    ) do node, stage
        @variable(node, x >= 0, SDDP.State, initial_value = 0.0)
        SDDP.parameterize(node, stage * [1, 3], [0.5, 0.5]) do ω
            return JuMP.set_lower_bound(x.out, ω)
        end
        @stageobjective(node, x.out)
    end
    SDDP.train(model, iteration_limit = 1, print_level = 0)
    rule = SDDP.Statistical(num_replications = 20)
    @test SDDP.stopping_rule_status(rule) == :statistical
    Random.seed!(123)
    @test SDDP.convergence_test(
        model,
        [SDDP.Log(1, 6.0, 9.0, 1.0, 1, 1, " ")],
        rule,
    )
    @test !SDDP.convergence_test(
        model,
        [SDDP.Log(1, 0.0, 9.0, 1.0, 1, 1, " ")],
        rule,
    )
    @test SDDP.convergence_test(
        model,
        [SDDP.Log(1, 12.0, 9.0, 1.0, 1, 1, " ")],
        rule,
    )

    model = SDDP.PolicyGraph(
        SDDP.LinearGraph(2),
        bellman_function = SDDP.BellmanFunction(upper_bound = 6.0),
        optimizer = GLPK.Optimizer,
        sense = :Max,
    ) do node, stage
        @variable(node, x >= 0, SDDP.State, initial_value = 0.0)
        SDDP.parameterize(node, stage * [1, 3], [0.5, 0.5]) do ω
            return JuMP.set_upper_bound(x.out, ω)
        end
        @stageobjective(node, x.out)
    end
    SDDP.train(model, iteration_limit = 1, print_level = 0)
    rule = SDDP.Statistical(num_replications = 20)
    @test SDDP.stopping_rule_status(rule) == :statistical
    Random.seed!(123)
    @test SDDP.convergence_test(
        model,
        [SDDP.Log(1, 6.0, 9.0, 1.0, 1, 1, " ")],
        rule,
    )
    @test SDDP.convergence_test(
        model,
        [SDDP.Log(1, 0.0, 9.0, 1.0, 1, 1, " ")],
        rule,
    )
    @test !SDDP.convergence_test(
        model,
        [SDDP.Log(1, 12.0, 9.0, 1.0, 1, 1, " ")],
        rule,
    )
    return
end

function test_BoundStalling()
    graph = SDDP.PolicyGraph(
        SDDP.LinearGraph(2),
        lower_bound = 0.0,
        direct_mode = false,
    ) do node, stage
        @variable(node, x, SDDP.State, initial_value = 0)
    end
    rule = SDDP.BoundStalling(3, 1.0)
    @test SDDP.stopping_rule_status(rule) == :bound_stalling
    # Not enough iterations to terminate.
    @test !SDDP.convergence_test(
        graph,
        [
            SDDP.Log(1, 0.0, 0.0, 1.0, 1, 1, " "),
            SDDP.Log(2, 1.9, 0.0, 1.0, 1, 1, " "),
            SDDP.Log(3, 2.0, 0.0, 1.0, 1, 1, " "),
            SDDP.Log(4, 2.0, 0.0, 1.0, 1, 1, " "),
        ],
        rule,
    )
    # Now there is. But only just...
    @test SDDP.convergence_test(
        graph,
        [
            SDDP.Log(1, 0.0, 0.0, 1.0, 1, 1, " "),
            SDDP.Log(2, 1.9, 0.0, 1.0, 1, 1, " "),
            SDDP.Log(3, 2.0, 0.0, 1.0, 1, 1, " "),
            SDDP.Log(4, 2.0, 0.0, 1.0, 1, 1, " "),
            SDDP.Log(5, 2.9, 0.0, 1.0, 1, 1, " "),
        ],
        rule,
    )
    # This also meets the test, but we don't terminate because it hasn't
    # differed from the initial bound.
    @test !SDDP.convergence_test(
        graph,
        [
            SDDP.Log(1, 0.0, 0.1, 1.0, 1, 1, " "),
            SDDP.Log(2, 0.0, 0.2, 1.1, 1, 2, " "),
            SDDP.Log(3, 0.0, 0.1, 1.2, 1, 3, " "),
            SDDP.Log(4, 0.0, 0.0, 1.3, 1, 4, " "),
        ],
        rule,
    )
    # This also meets the test, because it looks like a deterministic
    # policy
    @test SDDP.convergence_test(
        graph,
        [
            SDDP.Log(1, 0.0, 0.0, 1.0, 1, 1, " "),
            SDDP.Log(2, 0.0, 0.0, 1.0, 1, 1, " "),
            SDDP.Log(3, 0.0, 0.0, 1.0, 1, 1, " "),
            SDDP.Log(4, 0.0, 0.0, 1.0, 1, 1, " "),
        ],
        rule,
    )
    return
end

function test_StoppingChain()
    graph = SDDP.PolicyGraph(
        SDDP.LinearGraph(2),
        lower_bound = 0.0,
        direct_mode = false,
    ) do node, stage
        @variable(node, x, SDDP.State, initial_value = 0)
    end
    rule = SDDP.StoppingChain(SDDP.IterationLimit(2), SDDP.TimeLimit(60.0))
    @test SDDP.stopping_rule_status(rule) ==
          Symbol("iteration_limit ∧ time_limit")
    # Not enough iterations to terminate.
    @test !SDDP.convergence_test(
        graph,
        [SDDP.Log(1, 0.0, 0.0, 1.0, 1, 1, " ")],
        rule,
    )
    # How there is. But not enough time.
    @test !SDDP.convergence_test(
        graph,
        [
            SDDP.Log(1, 0.0, 0.0, 1.0, 1, 1, " "),
            SDDP.Log(2, 0.0, 0.0, 59.0, 1, 1, " "),
        ],
        rule,
    )
    # Both satisfied.
    @test SDDP.convergence_test(
        graph,
        [
            SDDP.Log(1, 0.0, 0.0, 1.0, 1, 1, " "),
            SDDP.Log(2, 0.0, 0.0, 59.0, 1, 1, " "),
            SDDP.Log(3, 0.0, 0.0, 60.1, 1, 1, " "),
        ],
        rule,
    )
    return
end

end  # module

TestStoppingRules.runtests()
